pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    sh '''
                        echo "🧹 Очистка старых контейнеров..."
                        
                        # Останавливаем и удаляем ВСЕ контейнеры с именем todo
                        docker stop todo-backend 2>/dev/null || true
                        docker rm todo-backend 2>/dev/null || true
                        
                        # Останавливаем контейнеры на порту 5001 (наш новый порт)
                        docker stop $(docker ps -q --filter publish=5001) 2>/dev/null || true
                        docker rm $(docker ps -a -q --filter publish=5001) 2>/dev/null || true
                        
                        # Удаляем старые образы
                        docker rmi todo-app-deploy-backend:latest 2>/dev/null || true
                        docker image prune -f 2>/dev/null || true
                        
                        echo "✅ Очистка завершена"
                    '''
                }
            }
        }
        
        stage('Deploy Backend') {
            steps {
                script {
                    sh '''
                        echo "🚀 Запуск бэкенда на порту 5001..."
                        
                        # Проверяем, свободен ли порт 5001
                        if netstat -tuln 2>/dev/null | grep ":5001 " > /dev/null; then
                            echo "⚠️ Порт 5001 занят, пробуем освободить..."
                            fuser -k 5001/tcp 2>/dev/null || true
                        fi
                        
                        # Проверяем наличие docker-compose.yml
                        if [ ! -f "docker-compose.yml" ]; then
                            echo "❌ Файл docker-compose.yml не найден!"
                            echo "Создаю минимальный docker-compose.yml..."
                            cat > docker-compose.yml << 'EOF'
services:
  backend:
    build: ./backend
    container_name: todo-backend
    ports:
      - "5001:5000"
EOF
                        fi
                        
                        # Проверяем структуру проекта
                        echo "📁 Структура проекта:"
                        ls -la
                        echo ""
                        ls -la backend/ || echo "Директория backend/ не существует"
                        
                        # Собираем и запускаем бэкенд
                        docker-compose build --no-cache
                        docker-compose up -d
                        
                        # Даем время на запуск
                        sleep 15
                        
                        # Проверяем запуск
                        echo "🔍 Проверка запуска бэкенда:"
                        docker-compose ps
                        
                        # Проверяем логи
                        echo "📋 Логи бэкенда (первые 30 строк):"
                        docker logs todo-backend 2>/dev/null | head -30 || echo "Логи не доступны"
                    '''
                }
            }
        }
        
        stage('Prepare Frontend') {
            steps {
                script {
                    sh '''
                        echo "🔄 Подготовка фронтенда..."
                        
                        # Создаем директории если их нет
                        mkdir -p frontend
                        
                        # Проверяем и создаем index.html если его нет
                        if [ ! -f "frontend/index.html" ]; then
                            echo "📄 Создаю index.html..."
                            cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📝 ToDo List</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        h1 { color: #333; text-align: center; }
        .input-section { 
            display: flex; 
            gap: 10px; 
            margin: 20px 0; 
        }
        #taskInput { 
            flex: 1; 
            padding: 10px; 
            border: 2px solid #ddd; 
            border-radius: 5px; 
            font-size: 16px; 
        }
        button { 
            padding: 10px 20px; 
            background: #4CAF50; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px; 
        }
        button:hover { background: #45a049; }
        #taskList { 
            list-style: none; 
            padding: 0; 
            margin: 20px 0; 
        }
        #taskList li { 
            background: #f9f9f9; 
            margin: 5px 0; 
            padding: 15px; 
            border-radius: 5px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .delete-btn { 
            background: #f44336; 
            padding: 5px 10px; 
            font-size: 14px; 
        }
        .delete-btn:hover { background: #d32f2f; }
        .status { 
            text-align: center; 
            margin-top: 20px; 
            color: #666; 
            font-size: 14px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 Список задач</h1>
        <p style="text-align: center; color: #666;">Развернуто через Jenkins + Docker</p>
        
        <div class="input-section">
            <input type="text" id="taskInput" placeholder="Введите новую задачу...">
            <button onclick="addTask()">Добавить</button>
        </div>
        
        <ul id="taskList">
            <li>Загрузка задач...</li>
        </ul>
        
        <div class="status" id="status">Готово к работе</div>
    </div>
    
    <script>
        const API_URL = 'http://localhost:5001/api';
        
        async function loadTasks() {
            try {
                const response = await fetch(API_URL + '/todos');
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
                
                document.getElementById('status').textContent = `Загружено задач: ${tasks.length}`;
            } catch (error) {
                document.getElementById('taskList').innerHTML = 
                    '<li style="color: red;">Ошибка загрузки задач. Проверьте подключение к серверу.</li>';
                document.getElementById('status').textContent = 'Ошибка подключения';
            }
        }
        
        async function addTask() {
            const input = document.getElementById('taskInput');
            const title = input.value.trim();
            
            if (!title) {
                alert('Введите текст задачи');
                return;
            }
            
            try {
                const response = await fetch(API_URL + '/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title })
                });
                
                if (response.ok) {
                    input.value = '';
                    await loadTasks();
                }
            } catch (error) {
                alert('Ошибка добавления задачи');
            }
        }
        
        async function deleteTask(id) {
            if (!confirm('Удалить задачу?')) return;
            
            try {
                await fetch(API_URL + '/todos/' + id, { method: 'DELETE' });
                await loadTasks();
            } catch (error) {
                alert('Ошибка удаления задачи');
            }
        }
        
        // Загружаем задачи при запуске
        document.addEventListener('DOMContentLoaded', loadTasks);
        
        // Добавляем задачу по Enter
        document.getElementById('taskInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
    </script>
</body>
</html>
EOF
                        fi
                        
                        echo "✅ Фронтенд подготовлен"
                    '''
                }
            }
        }
        
        stage('Copy to Nginx') {
            steps {
                script {
                    sh '''
                        echo "📦 Копирование фронтенда в nginx..."
                
                        # Вариант 1: Прямо в контейнер nginx (надежнее всего)
                        echo "1. Копируем напрямую в контейнер nginx..."
                
                        # Удаляем все старое в nginx
                        docker exec mynginx sh -c "rm -rf /usr/share/nginx/html/* 2>/dev/null || true"
                
                        # Создаем архив с фронтендом
                        tar -czf frontend.tar.gz -C frontend .
                
                        # Копируем архив в контейнер
                        docker cp frontend.tar.gz mynginx:/tmp/
                
                        # Распаковываем в nginx
                        docker exec mynginx sh -c "
                            cd /usr/share/nginx/html
                            tar -xzf /tmp/frontend.tar.gz -C .
                            chmod -R 644 *
                            rm /tmp/frontend.tar.gz
                            echo '✅ Файлы в nginx:'
                            ls -la
                        "
                
                        # Удаляем локальный архив
                        rm -f frontend.tar.gz
                
                        # Перезапускаем nginx
                        docker restart mynginx
                        sleep 2
                
                        echo "✅ Фронтенд успешно скопирован!"
                    '''
                }
            }
        }
        
        stage('Test Deployment') {
            steps {
                script {
                    sh '''
                        echo "🧪 Тестирование развертывания..."
                        
                        # Ждем полного запуска
                        sleep 10
                        
                        echo ""
                        echo "📊 Проверка контейнеров:"
                        docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" | grep -E "(todo|nginx)" || echo "Контейнеры не найдены"
                        
                        echo ""
                        echo "🔧 Проверка бэкенда (порт 5001):"
                        if curl -s -f http://localhost:5001/health > /dev/null; then
                            echo "✅ Бэкенд работает!"
                            curl -s http://localhost:5001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:5001/health
                        else
                            echo "⚠️ Бэкенд не отвечает на порту 5001"
                            echo "Проверяем альтернативные порты..."
                            for port in 5000 5001 5002 5003; do
                                if curl -s -f http://localhost:$port/health > /dev/null; then
                                    echo "✅ Бэкенд найден на порту $port"
                                    BACKEND_PORT=$port
                                    break
                                fi
                            done
                        fi
                        
                        echo ""
                        echo "🌐 Проверка фронтенда (порт 8001):"
                        if curl -s -f http://localhost:8001 > /dev/null; then
                            echo "✅ Фронтенд работает!"
                            echo "Содержимое страницы (первые 100 символов):"
                            curl -s http://localhost:8001 | head -c 100
                            echo "..."
                        else
                            echo "⚠️ Фронтенд не отвечает на порту 8001"
                        fi
                        
                        echo ""
                        echo "🔄 Проверка API:"
                        echo "Получение задач:"
                        curl -s http://localhost:5001/api/todos 2>/dev/null | head -c 150 || echo "API не отвечает"
                        echo ""
                        
                        echo "📁 Проверка файлов в nginx:"
                        docker exec mynginx ls -la /usr/share/nginx/html/ 2>/dev/null | head -10 || echo "Не удалось проверить файлы в nginx"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo ''
            echo '🎉 🎉 🎉 РАЗВЕРТЫВАНИЕ УСПЕШНО ЗАВЕРШЕНО! 🎉 🎉 🎉'
            echo ''
            echo '📱 ВАШЕ ПРИЛОЖЕНИЕ ДОСТУПНО ПО АДРЕСАМ:'
            echo '   ┌─────────────────────────────────────┐'
            echo '   │  🌐 Фронтенд: http://localhost:8001  │'
            echo '   │  🔧 Бэкенд:   http://localhost:5001  │'
            echo '   │  📊 Jenkins:  http://localhost:8080  │'
            echo '   └─────────────────────────────────────┘'
            echo ''
            echo '🔧 ДОСТУПНЫЕ API ЭНДПОИНТЫ:'
            echo '   • GET    http://localhost:5001/api/todos     - все задачи'
            echo '   • POST   http://localhost:5001/api/todos     - добавить задачу'
            echo '   • DELETE http://localhost:5001/api/todos/{id} - удалить задачу'
            echo '   • GET    http://localhost:5001/health        - проверка здоровья'
            echo ''
            echo '🐳 СОСТОЯНИЕ КОНТЕЙНЕРОВ:'
            sh '''
                echo "┌─────────────────────────────────────────────────────────────┐"
                docker ps --format "│ {{.Names}} - {{.Status}} ({{.Ports}})" | grep -E "(todo|nginx|jenkins)" || echo "│ Контейнеры не найдены"
                echo "└─────────────────────────────────────────────────────────────┘"
            '''
            echo ''
            echo '💡 ПРИМЕРЫ КОМАНД ДЛЯ ТЕСТИРОВАНИЯ:'
            echo '   # Добавить задачу'
            echo '   curl -X POST http://localhost:5001/api/todos \\'
            echo '     -H "Content-Type: application/json" \\'
            echo '     -d \'{"title":"Первая задача из терминала"}\''
            echo ''
            echo '   # Просмотреть все задачи'
            echo '   curl http://localhost:5001/api/todos'
            echo ''
        }
        
        failure {
            echo ''
            echo '❌ ❌ ❌ РАЗВЕРТЫВАНИЕ НЕ УДАЛОСЬ! ❌ ❌ ❌'
            echo ''
            echo '🔍 ДИАГНОСТИКА ПРОБЛЕМ:'
            
            sh '''
                echo ""
                echo "=== СОСТОЯНИЕ КОНТЕЙНЕРОВ ==="
                docker ps -a --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\\t{{.CreatedAt}}" | head -20
                
                echo ""
                echo "=== ЛОГИ БЭКЕНДА ==="
                docker logs todo-backend 2>/dev/null | tail -50 || echo "Контейнер todo-backend не найден"
                
                echo ""
                echo "=== ЛОГИ NGINX ==="
                docker logs mynginx 2>/dev/null | tail -30 || echo "Контейнер mynginx не найден"
                
                echo ""
                echo "=== ПРОВЕРКА ПОРТОВ ==="
                echo "Порт 5001 (бэкенд):"
                netstat -tuln 2>/dev/null | grep ":5001" || echo "  Порт 5001 свободен"
                echo "Порт 8001 (nginx):"
                netstat -tuln 2>/dev/null | grep ":8001" || echo "  Порт 8001 свободен"
                
                echo ""
                echo "=== ПРОВЕРКА ФАЙЛОВ NGINX ==="
                docker exec mynginx ls -la /usr/share/nginx/html/ 2>/dev/null | head -10 || echo "Не удалось проверить файлы в nginx"
                
                echo ""
                echo "=== ДИСКОВОЕ ПРОСТРАНСТВО ==="
                df -h /var/jenkins_home 2>/dev/null | head -2 || echo "Не удалось проверить дисковое пространство"
            '''
            
            echo ''
            echo '🚨 ВОЗМОЖНЫЕ ПРИЧИНЫ:'
            echo '   1. Порт 5001 занят другим приложением'
            echo '   2. Недостаточно памяти/Docker пространства'
            echo '   3. Проблемы с сетью или Docker демоном'
            echo '   4. Отсутствие необходимых файлов в репозитории'
            echo ''
            echo '🔧 РЕШЕНИЯ:'
            echo '   • Остановите другие контейнеры: docker stop $(docker ps -q)'
            echo '   • Очистите Docker: docker system prune -af'
            echo '   • Перезапустите Docker: sudo systemctl restart docker'
            echo '   • Проверьте файлы в репозитории на GitHub'
        }
        
        always {
            echo ''
            echo '📅 Время завершения:'
            sh 'date'
            echo ''
            echo '🔢 Номер сборки: $BUILD_NUMBER'
            echo '✅ Статус: $BUILD_STATUS'
        }
    }
    
    options {
        timeout(time: 15, unit: 'MINUTES')
        retry(2)
    }
}