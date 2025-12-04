// Конфигурация API
const API_BASE_URL = 'http://localhost:5001/api';

// DOM элементы
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');

// Загрузка задач при старте
document.addEventListener('DOMContentLoaded', loadTodos);

// Обработчик добавления задачи
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Функция загрузки задач
async function loadTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        const todos = await response.json();
        
        renderTodos(todos);
        updateStats(todos);
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load tasks. Please check if backend is running.');
    }
}

// Функция отрисовки задач
function renderTodos(todos) {
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <span class="todo-text">${todo.title}</span>
            <div class="todo-actions">
                <button class="toggle-btn" onclick="toggleTodo(${todo.id})">
                    <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

// Функция обновления статистики
function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    completedCount.textContent = `${completed} completed`;
}

// Функция добавления задачи
async function addTodo() {
    const title = todoInput.value.trim();
    
    if (!title) {
        showError('Please enter a task');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (response.ok) {
            todoInput.value = '';
            loadTodos();
        } else {
            showError('Failed to add task');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add task. Please check backend connection.');
    }
}

// Функция переключения статуса задачи
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            loadTodos();
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

// Функция удаления задачи
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTodos();
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Функция показа ошибок
function showError(message) {
    // Простой показ ошибки (можно улучшить)
    alert(`Error: ${message}`);
}

// Экспортируем функции для тестов
if (typeof module !== 'undefined') {
    module.exports = {
        loadTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateStats
    };
}