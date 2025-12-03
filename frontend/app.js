// Базовый URL для API
const API_URL = 'http://localhost:5001/api';

// Загружаем задачи при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTasks);

// Функция загрузки задач
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки задач');
        }
        
        const tasks = await response.json();
        const taskList = document.getElementById('taskList');
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li style="text-align: center; color: #888;">Список задач пуст</li>';
            return;
        }
        
        taskList.innerHTML = tasks.map(task => `
            <li>
                <span>${task.title}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Удалить</button>
            </li>
        `).join('');
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('taskList').innerHTML = 
            '<li style="color: #e53e3e;">⚠️ Ошибка загрузки задач. Проверьте подключение к серверу.</li>';
    }
}

// Функция добавления задачи
async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    
    if (!title) {
        alert('Введите текст задачи');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка добавления задачи');
        }
        
        input.value = ''; // Очищаем поле ввода
        await loadTasks(); // Перезагружаем список
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить задачу');
    }
}

// Функция удаления задачи
async function deleteTask(id) {
    if (!confirm('Удалить задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления задачи');
        }
        
        await loadTasks(); // Перезагружаем список
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить задачу');
    }
}

// Добавляем возможность добавлять задачу по Enter
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});