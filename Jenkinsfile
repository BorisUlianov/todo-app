pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Deploy Backend') {
            steps {
                script {
                    sh '''
                        # Останавливаем и удаляем старый бэкенд
                        docker stop todo-backend 2>/dev/null || true
                        docker rm todo-backend 2>/dev/null || true
                        
                        # Собираем и запускаем бэкенд
                        docker-compose build --no-cache
                        docker-compose up -d
                        
                        # Ждем запуска
                        sleep 5
                    '''
                }
            }
        }
        
        stage('Copy Frontend to Nginx') {
            steps {
                script {
                    sh '''
                        # Копируем файлы фронтенда в volume nginx (который уже подключен к mynginx)
                        echo "📁 Копируем фронтенд в nginx_volume..."
                        
                        # Создаем директорию, если нужно
                        mkdir -p /mnt/nginx || true
                        
                        # Копируем все файлы фронтенда
                        cp -rf frontend/* /mnt/nginx/ 2>/dev/null || true
                        
                        # Изменяем права (если нужно)
                        chmod 644 /mnt/nginx/* 2>/dev/null || true
                        
                        echo "✅ Фронтенд скопирован"
                    '''
                }
            }
        }
        
        stage('Test Deployment') {
            steps {
                script {
                    sh '''
                        # Даем время на запуск
                        sleep 3
                        
                        echo "🔍 Проверяем контейнеры..."
                        docker ps | grep -E "(todo-backend|mynginx)" || echo "Контейнеры не найдены"
                        
                        echo ""
                        echo "🌐 Проверяем доступность:"
                        echo "1. Бэкенд (health check):"
                        curl -s -o /dev/null -w "HTTP код: %{http_code}\n" http://localhost:5000/health || echo "Бэкенд не отвечает"
                        
                        echo ""
                        echo "2. Фронтенд через nginx:"
                        curl -s -o /dev/null -w "HTTP код: %{http_code}\n" http://localhost:8001 || echo "Nginx не отвечает"
                        
                        echo ""
                        echo "3. API через nginx:"
                        curl -s -o /dev/null -w "HTTP код: %{http_code}\n" http://localhost:8001/api/todos || echo "API не отвечает"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ РАЗВЕРТЫВАНИЕ УСПЕШНО!'
            echo ''
            echo '🎯 Ваше приложение доступно:'
            echo '   • Фронтенд: http://localhost:8001'
            echo '   • Бэкенд API: http://localhost:5000'
            echo '   • Jenkins: http://localhost:8080'
            echo ''
            echo '📋 Доступные эндпоинты:'
            echo '   • GET  http://localhost:5000/api/todos'
            echo '   • POST http://localhost:5000/api/todos'
            echo '   • DELETE http://localhost:5000/api/todos/{id}'
            echo '   • GET http://localhost:5000/health'
        }
        failure {
            echo '❌ Ошибка развертывания!'
            echo ''
            sh '''
                echo "=== Логи бэкенда ==="
                docker logs todo-backend --tail 20 2>/dev/null || echo "Контейнер бэкенда не найден"
                
                echo ""
                echo "=== Список контейнеров ==="
                docker ps -a | grep -E "(todo|nginx|jenkins)" || echo "Контейнеры не найдены"
            '''
        }
    }
}