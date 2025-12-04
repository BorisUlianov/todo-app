// АДАПТИВНЫЙ API URL - работает и для тестов, и для пользователя
function getApiBaseUrl() {
    // Если мы в Docker сети тестов (обращаемся к todo-backend)
    if (window.location.hostname === 'todo-frontend') {
        return 'http://todo-backend:5000/api';
    }
    // Если локальная разработка или пользовательский доступ
    else {
        return 'http://localhost:5001/api';
    }
}

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);
console.log('Hostname:', window.location.hostname);

// DOM элементы
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');

// Глобальное состояние
let todos = [];

// Загрузка задач при старте
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Todo App...');
    console.log('Using API:', API_BASE_URL);
    loadTodos();
    
    // Показываем информацию о подключении
    showConnectionInfo();
});

// Показать информацию о подключении
function showConnectionInfo() {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'connection-info';
    infoDiv.innerHTML = `
        <p><strong>Connected to:</strong> ${API_BASE_URL}</p>
        <p><strong>Status:</strong> <span id="connection-status">Checking...</span></p>
    `;
    document.querySelector('.container').appendChild(infoDiv);
    
    // Проверяем подключение
    checkConnection();
}

// Проверить подключение к API
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        const statusElement = document.getElementById('connection-status');
        if (response.ok) {
            statusElement.textContent = '✅ Connected';
            statusElement.style.color = 'green';
        } else {
            statusElement.textContent = '⚠️ API error';
            statusElement.style.color = 'orange';
        }
    } catch (error) {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = '❌ Connection failed';
        statusElement.style.color = 'red';
        console.error('Connection check failed:', error);
    }
}

// Обработчик добавления задачи
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Функция загрузки задач
async function loadTodos() {
    try {
        console.log('Loading todos from:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/todos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        todos = await response.json();
        console.log('Loaded todos:', todos.length, 'items');
        
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        // Показываем сообщение об ошибке
        todoList.innerHTML = `
            <li class="error">
                <i class="fas fa-exclamation-triangle"></i>
                Failed to load tasks: ${error.message}
                <br>
                <small>API: ${API_BASE_URL}</small>
            </li>
        `;
    }
}

// Функция отрисовки задач
function renderTodos() {
    console.log('Rendering', todos.length, 'todos');
    
    if (todos.length === 0) {
        todoList.innerHTML = `
            <li class="empty">
                <i class="fas fa-clipboard-list"></i>
                No tasks yet. Add one above!
            </li>
        `;
        return;
    }
    
    let html = '';
    todos.forEach(todo => {
        html += `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <span class="todo-text" onclick="toggleTodo(${todo.id})">
                    ${escapeHtml(todo.title)}
                </span>
                <div class="todo-actions">
                    <button class="toggle-btn" onclick="toggleTodo(${todo.id})">
                        <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </li>
        `;
    });
    
    todoList.innerHTML = html;
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция обновления статистики
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    completedCount.textContent = `${completed} completed`;
    
    console.log('Stats updated:', { total, completed });
}

// Функция добавления задачи
async function addTodo() {
    const title = todoInput.value.trim();
    
    if (!title) {
        showMessage('Please enter a task', 'warning');
        todoInput.focus();
        return;
    }
    
    console.log('Adding todo:', title);
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to add task: ${response.status}`);
        }
        
        const newTodo = await response.json();
        console.log('Todo added:', newTodo);
        
        // Очищаем поле ввода
        todoInput.value = '';
        todoInput.focus();
        
        // Показываем сообщение об успехе
        showMessage('Task added successfully!', 'success');
        
        // Обновляем список
        await loadTodos();
        
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage(`Failed to add task: ${error.message}`, 'error');
    }
}

// Функция переключения статуса задачи
async function toggleTodo(id) {
    console.log('Toggling todo:', id);
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to toggle task: ${response.status}`);
        }
        
        await loadTodos();
        
    } catch (error) {
        console.error('Error toggling todo:', error);
        showMessage(`Failed to toggle task: ${error.message}`, 'error');
    }
}

// Функция удаления задачи
async function deleteTodo(id) {
    // Находим задачу для отображения в сообщении
    const todo = todos.find(t => t.id === id);
    const taskName = todo ? todo.title : 'this task';
    
    if (!confirm(`Are you sure you want to delete "${taskName}"?`)) {
        return;
    }
    
    console.log('Deleting todo:', id);
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete task: ${response.status}`);
        }
        
        showMessage('Task deleted successfully!', 'success');
        await loadTodos();
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        showMessage(`Failed to delete task: ${error.message}`, 'error');
    }
}

// Показать временное сообщение
function showMessage(text, type = 'info') {
    // Удаляем старое сообщение если есть
    const oldMessage = document.querySelector('.temp-message');
    if (oldMessage) oldMessage.remove();
    
    const message = document.createElement('div');
    message.className = `temp-message ${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${text}
    `;
    
    document.querySelector('.container').appendChild(message);
    
    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
        if (message.parentNode) {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) message.remove();
            }, 300);
        }
    }, 3000);
}

// Сделать функции глобальными для onclick атрибутов
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// Экспортируем функции для тестов
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getApiBaseUrl,
        loadTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateStats,
        renderTodos
    };
}