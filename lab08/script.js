document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    addTaskButton.addEventListener('click', addTask);

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const listItem = createTaskItem(taskText);
            taskList.appendChild(listItem);
            taskInput.value = '';
        }
    }

    function createTaskItem(taskText) {
        const listItem = document.createElement('li');

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;
        listItem.appendChild(taskSpan);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => editTask(listItem, taskSpan));
        listItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => deleteTask(listItem));
        listItem.appendChild(deleteButton);

        return listItem;
    }

    function editTask(listItem, taskSpan) {
        const taskText = taskSpan.textContent;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = taskText;
        listItem.insertBefore(inputField, taskSpan);
        listItem.removeChild(taskSpan);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.classList.add('save-button');
        saveButton.addEventListener('click', () => saveTask(listItem, inputField));
        listItem.insertBefore(saveButton, listItem.querySelector('.edit-button'));
        listItem.removeChild(listItem.querySelector('.edit-button'));
    }

    function saveTask(listItem, inputField) {
        const taskText = inputField.value.trim();
        if (taskText !== '') {
            const taskSpan = document.createElement('span');
            taskSpan.textContent = taskText;
            listItem.insertBefore(taskSpan, inputField);
            listItem.removeChild(inputField);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', () => editTask(listItem, taskSpan));
            listItem.insertBefore(editButton, listItem.querySelector('.save-button'));
            listItem.removeChild(listItem.querySelector('.save-button'));
        }
    }

    function deleteTask(listItem) {
        taskList.removeChild(listItem);
    }
});
