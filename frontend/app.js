const API_URL = 'http://localhost:5050/api';

async function loadTasks() {
    const response = await fetch(`${API_URL}/todos`);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.title}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Удалить</button>
        `;
        taskList.appendChild(li);
    });
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    
    if (!title) return;
    
    await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    
    input.value = '';
    await loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    await loadTasks();
}

// Загружаем задачи при старте
document.addEventListener('DOMContentLoaded', loadTasks);