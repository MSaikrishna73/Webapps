document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('current-month');
    const selectedDateElement = document.getElementById('selected-date');
    const taskTitleInput = document.getElementById('modal-task-title');
    const taskDescriptionInput = document.getElementById('modal-task-description');
    const dateInput = document.getElementById('modal-task-date');
    const deadlineInput = document.getElementById('modal-task-deadline');
    const addTaskButton = document.getElementById('modal-add-task-button');
    const taskList = document.getElementById('task-list');
    const allTasksList = document.getElementById('all-tasks-list');
    const taskSection = document.querySelector('.task-section');
    const allTasksSection = document.querySelector('.all-tasks-section');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const viewToggleButton = document.getElementById('view-toggle-button');
    const addTaskModalButton = document.getElementById('add-task-modal-button');
    const addTaskModal = document.getElementById('add-task-modal');
    const pastDateModal = document.getElementById('past-date-modal');
    const closeModalButton = document.querySelector('.close');
    const closePastModalButton = document.querySelector('.close-past-modal');
    const highPriorityCheckbox = document.getElementById('modal-high-priority');
    const noTasksMessage = document.getElementById('no-tasks-message');

    let selectedDate = null;
    let tasks = {};
    let currentDate = new Date();
    let isCalendarView = true;

    prevMonthButton.addEventListener('click', () => navigateMonth(-1));
    nextMonthButton.addEventListener('click', () => navigateMonth(1));
    addTaskButton.addEventListener('click', addTask);
    viewToggleButton.addEventListener('click', toggleView);
    addTaskModalButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    closePastModalButton.addEventListener('click', closePastModal);
    window.addEventListener('click', outsideClick);

    function navigateMonth(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        generateCalendar();
    }

    function generateCalendar() {
        calendar.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        currentMonthElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        for (let i = 0; i < firstDay; i++) {
            const placeholder = document.createElement('div');
            calendar.appendChild(placeholder);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            const dateKey = new Date(year, month, day).toDateString();
            if (tasks[dateKey] && tasks[dateKey].length > 0) {
                dayElement.classList.add('task-day');
            }
            dayElement.addEventListener('click', () => selectDate(new Date(year, month, day), dayElement));
            calendar.appendChild(dayElement);
        }
    }

    function selectDate(date, dayElement) {
        if (selectedDate) {
            calendar.querySelectorAll('div').forEach(dayElement => {
                dayElement.classList.remove('selected');
                dayElement.classList.remove('white');
            });
        }
        selectedDate = date;
        selectedDateElement.textContent = selectedDate.toDateString();
        taskSection.style.display = 'block';
        renderTasks();
        if (dayElement.style.color === 'rgb(255, 140, 0)') {
            dayElement.classList.add('selected');
        } else {
            dayElement.classList.add('selected', 'white');
        }
    }

    function addTask() {
        const taskTitle = taskTitleInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        const taskDate = dateInput.value ? new Date(dateInput.value) : null;
        const taskDeadline = deadlineInput.value;
        const isHighPriority = highPriorityCheckbox.checked;

        if (taskDate && taskDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            openPastModal();
            return;
        }

        if (taskTitle !== '') {
            const dateKey = taskDate ? taskDate.toDateString() : 'No Date';
            if (!tasks[dateKey]) {
                tasks[dateKey] = [];
            }
            tasks[dateKey].push({ title: taskTitle, description: taskDescription, deadline: taskDeadline, highPriority: isHighPriority, done: false });
            taskTitleInput.value = '';
            taskDescriptionInput.value = '';
            dateInput.value = '';
            deadlineInput.value = '';
            highPriorityCheckbox.checked = false;
            closeModal();
            renderTasks();
            renderAllTasks();
            generateCalendar();
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const dateKey = selectedDate.toDateString();
        if (tasks[dateKey] && tasks[dateKey].length > 0) {
            tasks[dateKey].forEach((task, index) => {
                const listItem = createTaskItem(task, index, dateKey);
                taskList.appendChild(listItem);
            });
            noTasksMessage.style.display = 'none';
        } else {
            noTasksMessage.style.display = 'block';
        }
    }

    function renderAllTasks() {
        allTasksList.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        Object.keys(tasks).forEach(dateKey => {
            const taskDate = new Date(dateKey);
            if (dateKey === 'No Date' || (taskDate.getFullYear() === year && taskDate.getMonth() === month)) {
                tasks[dateKey].forEach((task, index) => {
                    const listItem = createTaskItem(task, index, dateKey);
                    allTasksList.appendChild(listItem);
                });
            }
        });
    }

    function createTaskItem(task, index, dateKey) {
        const listItem = document.createElement('li');

        const taskTitle = document.createElement('div');
        taskTitle.className = 'task-title';
        taskTitle.textContent = task.title;

        const taskDescription = document.createElement('div');
        taskDescription.className = 'task-description';
        taskDescription.textContent = task.description;
        if (task.deadline) {
            taskDescription.textContent += ` (by ${task.deadline})`;
        }

        if (dateKey !== 'No Date') {
            const taskDate = document.createElement('div');
            taskDate.className = 'task-date';
            taskDate.textContent = dateKey;
            listItem.appendChild(taskDate);
        }

        if (task.highPriority) {
            taskTitle.style.color = '#ff8c00';
            taskTitle.style.fontWeight = 'bold';
            taskTitle.classList.add('orange');
        } else {
            taskTitle.classList.add('white');
        }
        if (task.done) {
            taskTitle.classList.add('task-done');
        }
        listItem.appendChild(taskTitle);
        listItem.appendChild(taskDescription);

        const doneButton = document.createElement('span');
        doneButton.textContent = '✔';
        doneButton.classList.add('done-button');
        doneButton.addEventListener('click', () => toggleDone(taskTitle, index, dateKey));
        listItem.appendChild(doneButton);

        const editButton = document.createElement('span');
        editButton.innerHTML = '&#9998;'; // Pencil icon
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => editTask(listItem, taskTitle, taskDescription, index, dateKey));
        listItem.appendChild(editButton);

        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = '&#128465;'; // Trash can icon
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => deleteTask(index, dateKey));
        listItem.appendChild(deleteButton);

        return listItem;
    }

    function toggleDone(taskTitle, index, dateKey) {
        tasks[dateKey][index].done = !tasks[dateKey][index].done;
        taskTitle.classList.toggle('task-done');
        if (tasks[dateKey][index].highPriority) {
            taskTitle.classList.toggle('orange');
        } else {
            taskTitle.classList.toggle('white');
        }
    }

    function editTask(listItem, taskTitle, taskDescription, index, dateKey) {
        const taskTitleText = taskTitle.textContent;
        const taskDescriptionText = taskDescription.textContent.split(' (by ')[0];
        const taskDeadline = taskDescription.textContent.split(' (by ')[1] ? taskDescription.textContent.split(' (by ')[1].slice(0, -1) : '';
        const titleField = document.createElement('input');
        titleField.type = 'text';
        titleField.value = taskTitleText;
        const descriptionField = document.createElement('textarea');
        descriptionField.value = taskDescriptionText;
        const deadlineField = document.createElement('input');
        deadlineField.type = 'time';
        deadlineField.value = taskDeadline;
        listItem.insertBefore(titleField, taskTitle);
        listItem.insertBefore(descriptionField, taskDescription);
        listItem.insertBefore(deadlineField, taskDescription);
        listItem.removeChild(taskTitle);
        listItem.removeChild(taskDescription);

        const saveButton = document.createElement('span');
        saveButton.textContent = 'Save';
        saveButton.classList.add('save-button');
        saveButton.addEventListener('click', () => saveTask(listItem, titleField, descriptionField, deadlineField, index, dateKey));
        listItem.insertBefore(saveButton, listItem.querySelector('.edit-button'));
        listItem.removeChild(listItem.querySelector('.edit-button'));
    }

    function saveTask(listItem, titleField, descriptionField, deadlineField, index, dateKey) {
        const taskTitleText = titleField.value.trim();
        const taskDescriptionText = descriptionField.value.trim();
        const taskDeadline = deadlineField.value;
        if (taskTitleText !== '') {
            const taskTitle = document.createElement('div');
            taskTitle.className = 'task-title';
            taskTitle.textContent = taskTitleText;

            const taskDescription = document.createElement('div');
            taskDescription.className = 'task-description';
            taskDescription.textContent = taskDescriptionText;
            if (taskDeadline) {
                taskDescription.textContent += ` (by ${taskDeadline})`;
            }

            if (tasks[dateKey][index].highPriority) {
                taskTitle.style.color = '#ff8c00';
                taskTitle.style.fontWeight = 'bold';
                taskTitle.classList.add('orange');
            } else {
                taskTitle.classList.add('white');
            }
            if (tasks[dateKey][index].done) {
                taskTitle.classList.add('task-done');
            }
            listItem.insertBefore(taskTitle, titleField);
            listItem.insertBefore(taskDescription, descriptionField);
            listItem.removeChild(titleField);
            listItem.removeChild(descriptionField);
            listItem.removeChild(deadlineField);

            const editButton = document.createElement('span');
            editButton.innerHTML = '&#9998;';
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', () => editTask(listItem, taskTitle, taskDescription, index, dateKey));
            listItem.insertBefore(editButton, listItem.querySelector('.save-button'));
            listItem.removeChild(listItem.querySelector('.save-button'));

            tasks[dateKey][index].title = taskTitleText;
            tasks[dateKey][index].description = taskDescriptionText;
            tasks[dateKey][index].deadline = taskDeadline;
            generateCalendar();
        }
    }

    function deleteTask(index, dateKey) {
        tasks[dateKey].splice(index, 1);
        renderTasks();
        renderAllTasks();
        generateCalendar();
    }

    function toggleView() {
        isCalendarView = !isCalendarView;
        if (isCalendarView) {
            calendar.style.display = 'grid';
            viewToggleButton.textContent = 'List';
            taskSection.style.display = 'block';
            allTasksSection.style.display = 'none';
        } else {
            calendar.style.display = 'none';
            viewToggleButton.textContent = 'Calendar';
            taskSection.style.display = 'none';
            allTasksSection.style.display = 'block';
            renderAllTasks();
        }
    }

    function openModal() {
        addTaskModal.style.display = 'block';
    }

    function closeModal() {
        addTaskModal.style.display = 'none';
    }

    function openPastModal() {
        pastDateModal.style.display = 'block';
    }

    function closePastModal() {
        pastDateModal.style.display = 'none';
    }

    function outsideClick(event) {
        if (event.target == addTaskModal) {
            closeModal();
        } else if (event.target == pastDateModal) {
            closePastModal();
        }
    }

    generateCalendar();
});
