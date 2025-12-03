// ИСПОЛЬЗУЙТЕ ОТНОСИТЕЛЬНЫЙ ПУТЬ через nginx
const API_URL = '/api';  // Вместо http://localhost:5001/api

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li style="text-align: center; color: #888;">Нет задач. Добавьте первую!</li>';
            return;
        }
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task.title}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Удалить</button>
            `;
            taskList.appendChild(li);
        });
        
        // Обновляем статус
        const statusEl = document.getElementById('status') || document.querySelector('.status');
        if (statusEl) {
            statusEl.textContent = `Загружено задач: ${tasks.length}`;
        }
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '<li style="color: #f44336; text-align: center;">⚠️ Ошибка подключения к серверу</li>';
        
        // Показываем дополнительную информацию для отладки
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = 'color: #666; font-size: 12px; margin-top: 10px; text-align: center;';
        debugInfo.innerHTML = `
            <div>Проверьте:</div>
            <div>1. Запущен ли бэкенд: <code>docker ps | grep todo-backend</code></div>
            <div>2. Доступен ли API: <a href="http://localhost:5001/health" target="_blank">http://localhost:5001/health</a></div>
            <div>3. Проверьте консоль браузера (F12 → Console)</div>
        `;
        taskList.appendChild(debugInfo);
    }
}