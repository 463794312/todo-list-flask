let currentFilter = 'all'; // Default filter: show all tasks

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Load tasks from backend on page load
    loadTasks();

    // Add event listener for add task button
    addTaskBtn.addEventListener('click', addTask);

    // Add event listener for enter key in input field
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Add event listeners for filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update current filter
            currentFilter = btn.dataset.filter;
            // Reload tasks with new filter
            loadTasks();
        });
    });
});

/**
 * Load all tasks from backend API and render them on the page
 */
async function loadTasks() {
    try {
        // Fetch tasks from backend API
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const tasks = data.tasks || [];

        // Render tasks to the page
        renderTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Please try again later.');
    }
}

/**
 * Render tasks to the page based on current filter
 * @param {Array} tasks - Array of task objects from backend
 */
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    // Clear existing tasks
    taskList.innerHTML = '';

    // Filter tasks based on current filter
    const filteredTasks = filterTasks(tasks);

    // If no tasks, show empty state
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${currentFilter === 'all' ? 'No tasks yet. Add a new task to get started!' : 
                  currentFilter === 'active' ? 'No active tasks. All tasks are completed!' : 
                  'No completed tasks. Mark some tasks as complete!'}</p>
            </div>
        `;
        return;
    }

    // Render each task item
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.dataset.taskId = task.id;

        // Create task HTML
        taskItem.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.content)}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add event listener for checkbox (update task status)
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            updateTaskStatus(task.id, checkbox.checked ? 1 : 0);
        });

        // Add event listener for delete button
        const deleteBtn = taskItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteTask(task.id);
        });

        // Add task item to task list
        taskList.appendChild(taskItem);
    });
}

/**
 * Filter tasks based on current filter type
 * @param {Array} tasks - Array of all tasks
 * @returns {Array} Filtered tasks array
 */
function filterTasks(tasks) {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => task.completed === 0);
        case 'completed':
            return tasks.filter(task => task.completed === 1);
        default: // all
            return tasks;
    }
}

/**
 * Add a new task to the backend
 */
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskContent = taskInput.value.trim();

    // Validate input
    if (!taskContent) {
        showError('Task content cannot be empty!');
        return;
    }

    try {
        // Send POST request to backend API
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: taskContent }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add task');
        }

        // Clear input field
        taskInput.value = '';
        // Reload tasks to show the new task
        loadTasks();
        // Show success message (optional)
        showSuccess('Task added successfully!');
    } catch (error) {
        console.error('Error adding task:', error);
        showError(error.message);
    }
}

/**
 * Update task completion status
 * @param {number} taskId - ID of the task to update
 * @param {number} completed - 1 for completed, 0 for active
 */
async function updateTaskStatus(taskId, completed) {
    try {
        // Send PUT request to backend API
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: completed }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update task');
        }

        // Reload tasks to reflect the change
        loadTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        showError(error.message);
    }
}

/**
 * Delete a task from the backend
 * @param {number} taskId - ID of the task to delete
 */
async function deleteTask(taskId) {
    // Confirm deletion (optional but user-friendly)
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        // Send DELETE request to backend API
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete task');
        }

        // Reload tasks to remove the deleted task
        loadTasks();
        // Show success message (optional)
        showSuccess('Task deleted successfully!');
    } catch (error) {
        console.error('Error deleting task:', error);
        showError(error.message);
    }
}

/**
 * Escape HTML characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show success message (you can customize this style)
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '10px 20px';
    messageEl.style.backgroundColor = '#4CAF50';
    messageEl.style.color = 'white';
    messageEl.style.borderRadius = '4px';
    messageEl.style.zIndex = '1000';
    messageEl.textContent = message;

    // Add to document
    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '10px 20px';
    messageEl.style.backgroundColor = '#f44336';
    messageEl.style.color = 'white';
    messageEl.style.borderRadius = '4px';
    messageEl.style.zIndex = '1000';
    messageEl.textContent = message;

    // Add to document
    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}