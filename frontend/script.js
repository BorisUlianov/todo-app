// Конфигурация API - ДЛЯ ТЕСТОВ используем внутренний адрес
const API_BASE_URL = 'http://todo-backend:5000/api';
// Для локальной разработки можно оставить: 'http://localhost:5001/api'

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
    console.log('DOM loaded, initializing...');
    loadTodos();
});

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
        console.log('Loaded todos:', todos);
        
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        // Показываем сообщение об ошибке
        todoList.innerHTML = `<li class="error">Failed to load tasks: ${error.message}</li>`;
    }
}

// Функция отрисовки задач
function renderTodos() {
    console.log('Rendering todos:', todos);
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty">No tasks yet. Add one above!</li>';
        return;
    }
    
    let html = '';
    todos.forEach(todo => {
        html += `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <span class="todo-text">${escapeHtml(todo.title)}</span>
                <div class="todo-actions">
                    <button class="toggle-btn" onclick="toggleTodo(${todo.id})">
                        <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
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
        alert('Please enter a task');
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
        
        // Обновляем список
        await loadTodos();
        
    } catch (error) {
        console.error('Error adding todo:', error);
        alert(`Failed to add task: ${error.message}`);
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
        alert(`Failed to toggle task: ${error.message}`);
    }
}

// Функция удаления задачи
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
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
        
        await loadTodos();
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert(`Failed to delete task: ${error.message}`);
    }
}

// Экспортируем функции для тестов
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateStats,
        renderTodos
    };
}