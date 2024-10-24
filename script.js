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

function createDraggableTask(task) {                                                    // Function to create a draggable task element
    let new_ele = document.createElement("li");
    new_ele.textContent = task;
    new_ele.setAttribute("draggable", "true");

    new_ele.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", task);
        e.target.classList.add("dragging");
    });

    new_ele.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
    });

    new_ele.addEventListener("click", () => {
        todo.removeChild(new_ele);
        saveTodoTasks();
    });

    return new_ele;
}

function saveTodoTasks() {                                                                      // Function to save TODO tasks to localStorage
    const todoItems = Array.from(todo.children).map(item => item.textContent);
    localStorage.setItem('todoTasks', JSON.stringify(todoItems));
}
function saveDoneTasks() {                                                                                      // Function to save DONE tasks to localStorage
    const doneItems = Array.from(done.children).filter(item => item !== drag_place).map(item => item.textContent);
    localStorage.setItem('doneTasks', JSON.stringify(doneItems));
}

function loadTasks() {                                                                              // Function to load tasks from localStorage
    const savedTodoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
    const savedDoneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];

    
    savedTodoTasks.forEach(task => {                          // Load TODO tasks
        let new_ele = createDraggableTask(task);
        todo.appendChild(new_ele);
    });

    savedDoneTasks.forEach(task => {                          // Load DONE tasks
        let new_ele_done = createDraggableTask(task);
        done.appendChild(new_ele_done);
    });
    updateDragPlaceholder();                                  // Show or hide the drag placeholder based on the done tasks
}

function updateDragPlaceholder() {                            // Function to update the visibility of the drag placeholder
    done.appendChild(drag_place);
}
                                            
new_task.addEventListener("click", () => {                    // Event listener to add a new task
    let curr_task = input_val.value.trim();
    input_val.value = "";

    if (curr_task !== "") {
        let new_ele = createDraggableTask(curr_task);
        todo.appendChild(new_ele);
        saveTodoTasks();
    } 
});


done.addEventListener("dragover", (e) => {                     // Allow dropping onto the DONE list
    e.preventDefault(); 
});
done.addEventListener("drop", (e) => {                          // Handle dropping of tasks into the DONE list
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
        updateDragPlaceholder();                                // Update placeholder visibility after dropping a task
    }
});

delete_task.addEventListener("click", () => {                   // Event listener to delete all done tasks
    done.innerHTML = "";                                        // Clear done list
    done.appendChild(drag_place);                               // Re-add drag placeholder
    saveDoneTasks();                                            // Save the empty state
});

window.onload = loadTasks;                                      // Load tasks on page load