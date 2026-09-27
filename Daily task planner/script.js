/* =========================================
   Daily Task Planner
   ========================================= */


/* -----------------------------------------
   DOM Elements
----------------------------------------- */

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const errorMessage = document.getElementById("errorMessage");
const currentDate = document.getElementById("currentDate");
const currentYear = document.getElementById("currentYear");
const filterButtons = document.querySelectorAll(".filter-btn");


/* -----------------------------------------
   Application Data
----------------------------------------- */

let tasks = [];
let currentFilter = "all";


/* -----------------------------------------
   Load Tasks from LocalStorage
----------------------------------------- */

function loadTasks() {

    const savedTasks = localStorage.getItem("dailyTasks");

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);

            if (!Array.isArray(tasks)) {
                tasks = [];
            }

        } catch (error) {
            tasks = [];
            console.error("Unable to load saved tasks. - script.js:46");
        }
    }

    renderTasks();
}


/* -----------------------------------------
   Save Tasks to LocalStorage
----------------------------------------- */

function saveTasks() {

    localStorage.setItem(
        "dailyTasks",
        JSON.stringify(tasks)
    );
}


/* -----------------------------------------
   Display Current Date
----------------------------------------- */

function displayDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-IN", options);

    currentYear.textContent =
        today.getFullYear();
}


/* -----------------------------------------
   Create New Task
----------------------------------------- */

function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {

        errorMessage.classList.remove("d-none");
        taskInput.focus();

        return;
    }

    errorMessage.classList.add("d-none");

    const newTask = {
        id: Date.now(),
        title: title,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}


/* -----------------------------------------
   Render Tasks
----------------------------------------- */

function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });


    if (filteredTasks.length === 0) {

        emptyMessage.classList.remove("d-none");

    } else {

        emptyMessage.classList.add("d-none");

        filteredTasks.forEach(function(task) {

            const taskElement = createTaskElement(task);

            taskList.appendChild(taskElement);

        });
    }
}


/* -----------------------------------------
   Create Task HTML Element
----------------------------------------- */

function createTaskElement(task) {

    const taskItem = document.createElement("div");

    taskItem.className = "task-item";

    if (task.completed) {
        taskItem.classList.add("completed");
    }


    /* Task Content */

    const taskContent = document.createElement("div");

    taskContent.className = "task-content";


    /* Checkbox */

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "form-check-input task-check";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function() {

        toggleTask(task.id);

    });


    /* Task Title */

    const title = document.createElement("span");

    title.className = "task-title";
    title.textContent = task.title;


    taskContent.appendChild(checkbox);
    taskContent.appendChild(title);


    /* Action Buttons */

    const actions = document.createElement("div");

    actions.className = "task-actions";


    /* Edit Button */

    const editButton = document.createElement("button");

    editButton.className = "btn btn-sm btn-outline-primary";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function() {

        startEditing(task.id);

    });


    /* Delete Button */

    const deleteButton = document.createElement("button");

    deleteButton.className = "btn btn-sm btn-outline-danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function() {

        deleteTask(task.id);

    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    taskItem.appendChild(taskContent);
    taskItem.appendChild(actions);


    return taskItem;
}


/* -----------------------------------------
   Toggle Task
----------------------------------------- */

function toggleTask(taskId) {

    tasks = tasks.map(function(task) {

        if (task.id === taskId) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;
    });

    saveTasks();
    renderTasks();
}


/* -----------------------------------------
   Delete Task
----------------------------------------- */

function deleteTask(taskId) {

    tasks = tasks.filter(function(task) {

        return task.id !== taskId;

    });

    saveTasks();
    renderTasks();
}


/* -----------------------------------------
   Edit Task
----------------------------------------- */

function startEditing(taskId) {

    const taskItem = [...taskList.children].find(function(item) {

        const checkbox = item.querySelector(".task-check");

        return checkbox &&
               tasks.find(task =>
                   task.id === taskId
               );
    });


    const task = tasks.find(function(item) {

        return item.id === taskId;

    });


    if (!task) {
        return;
    }


    const taskElements = taskList.querySelectorAll(".task-item");

    let selectedElement = null;

    taskElements.forEach(function(element) {

        const checkbox = element.querySelector(".task-check");

        if (checkbox) {

            const displayedTask = tasks.find(function(item) {

                return item.title ===
                    element.querySelector(".task-title")?.textContent;

            });

            if (displayedTask && displayedTask.id === taskId) {
                selectedElement = element;
            }
        }
    });


    if (!selectedElement) {
        return;
    }


    const content = selectedElement.querySelector(".task-content");
    const actions = selectedElement.querySelector(".task-actions");

    const oldTitle = task.title;


    /* Create Edit Input */

    const editInput = document.createElement("input");

    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.value = oldTitle;


    /* Replace title */

    const titleElement =
        selectedElement.querySelector(".task-title");

    titleElement.replaceWith(editInput);


    /* Clear buttons */

    actions.innerHTML = "";


    /* Save Button */

    const saveButton = document.createElement("button");

    saveButton.className = "btn btn-sm btn-success";
    saveButton.textContent = "Save";


    /* Cancel Button */

    const cancelButton = document.createElement("button");

    cancelButton.className = "btn btn-sm btn-secondary";
    cancelButton.textContent = "Cancel";


    actions.appendChild(saveButton);
    actions.appendChild(cancelButton);


    editInput.focus();


    /* Save */

    saveButton.addEventListener("click", function() {

        const updatedTitle = editInput.value.trim();

        if (updatedTitle === "") {
            editInput.focus();
            return;
        }

        task.title = updatedTitle;

        saveTasks();
        renderTasks();
    });


    /* Cancel */

    cancelButton.addEventListener("click", function() {

        renderTasks();

    });


    /* Enter Key */

    editInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            saveButton.click();
        }

        if (event.key === "Escape") {
            cancelButton.click();
        }

    });
}


/* -----------------------------------------
   Filter Tasks
----------------------------------------- */

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;


        filterButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        renderTasks();

    });

});


/* -----------------------------------------
   Add Task Button
----------------------------------------- */

addTaskBtn.addEventListener("click", addTask);


/* -----------------------------------------
   Enter Key to Add Task
----------------------------------------- */

taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        addTask();

    }

});


/* -----------------------------------------
   Remove Error While Typing
----------------------------------------- */

taskInput.addEventListener("input", function() {

    if (taskInput.value.trim() !== "") {

        errorMessage.classList.add("d-none");

    }

});


/* -----------------------------------------
   Start Application
----------------------------------------- */

displayDate();
loadTasks();