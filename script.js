let todo = document.querySelector("#todoTasks");            // TODO list
let done = document.querySelector("#doneTasks");            // DONE list
let input_val = document.querySelector("#taskInput");       // Input field for tasks
let new_task = document.querySelector("#add_task");         // Button to add a task
let delete_task = document.querySelector("#delete_task");   // Button to delete done tasks

// Create a placeholder for drag area
let drag_place = document.createElement("li");              
drag_place.textContent = "Drag here to drop tasks";
drag_place.style.color = "gray";
drag_place.style.border = "1px dashed #ccc"; 
drag_place.style.padding = "10px";
drag_place.style.textAlign = "center";
done.appendChild(drag_place);                                                           // Add placeholder to done list

let currentDrag;  // To hold the currently dragged element

function createDraggableTask(task) {
    let new_ele = document.createElement("li");
    new_ele.textContent = task;
    new_ele.setAttribute("draggable", "true");

    // Add mouse events for desktop
    new_ele.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", task);
        e.target.classList.add("dragging");
    });

    new_ele.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
    });

    // Add touch events for mobile
    new_ele.addEventListener("touchstart", (e) => {
        currentDrag = new_ele;
        e.preventDefault();  // Prevent default to allow touch move
    });

    return new_ele;
}

function saveTodoTasks() {
    const todoItems = Array.from(todo.children).map(item => item.textContent);
    localStorage.setItem('todoTasks', JSON.stringify(todoItems));
}

function saveDoneTasks() {
    const doneItems = Array.from(done.children).filter(item => item !== drag_place).map(item => item.textContent);
    localStorage.setItem('doneTasks', JSON.stringify(doneItems));
}

function loadTasks() {
    const savedTodoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
    const savedDoneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];

    savedTodoTasks.forEach(task => {
        let new_ele = createDraggableTask(task);
        todo.appendChild(new_ele);
    });

    savedDoneTasks.forEach(task => {
        let new_ele_done = createDraggableTask(task);
        done.appendChild(new_ele_done);
    });
    updateDragPlaceholder();
}

function updateDragPlaceholder() {
    done.appendChild(drag_place);
}

new_task.addEventListener("click", () => {
    let curr_task = input_val.value.trim();
    input_val.value = "";

    if (curr_task !== "") {
        let new_ele = createDraggableTask(curr_task);
        todo.appendChild(new_ele);
        saveTodoTasks();
    } 
});

// Allow dropping onto the DONE list for desktop
done.addEventListener("dragover", (e) => {
    e.preventDefault(); 
});

done.addEventListener("drop", (e) => {
    e.preventDefault(); 
    const task = e.dataTransfer.getData("text/plain");
    if (task) {
        let todoItems = Array.from(todo.children);
        let todoItemToRemove = todoItems.find(item => item.textContent === task);
        let new_ele_done = createDraggableTask(task);
        done.appendChild(new_ele_done);
        if (todoItemToRemove) {
            todo.removeChild(todoItemToRemove);
            saveTodoTasks(); 
        }
        saveDoneTasks();
        updateDragPlaceholder();
    }
});

// Add touch move event for mobile
done.addEventListener("touchmove", (e) => {
    if (currentDrag) {
        const touchLocation = e.touches[0];
        currentDrag.style.position = 'absolute';
        currentDrag.style.left = `${touchLocation.clientX}px`;
        currentDrag.style.top = `${touchLocation.clientY}px`;
    }
});

// Add touch end event for mobile
done.addEventListener("touchend", (e) => {
    if (currentDrag) {
        let touchLocation = e.changedTouches[0];
        const dropArea = done.getBoundingClientRect();
        
        // Check if the touch location is inside the DONE list
        if (touchLocation.clientX >= dropArea.left && touchLocation.clientX <= dropArea.right &&
            touchLocation.clientY >= dropArea.top && touchLocation.clientY <= dropArea.bottom) {
            done.appendChild(currentDrag);
            saveDoneTasks();
        } else {
            todo.appendChild(currentDrag); // If not dropped in the DONE area, return it to TODO
            saveTodoTasks();
        }

        currentDrag.style.position = '';  // Reset position
        currentDrag = null;  // Clear the current drag reference
        updateDragPlaceholder(); // Update placeholder visibility after dropping a task
    }
});

// Add event listener to delete all done tasks
delete_task.addEventListener("click", () => {
    done.innerHTML = "";                                        // Clear done list
    done.appendChild(drag_place);                               // Re-add drag placeholder
    saveDoneTasks();                                            // Save the empty state
});

window.onload = loadTasks;                                      // Load tasks on page load