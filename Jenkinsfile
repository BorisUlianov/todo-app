pipeline {
    agent any
    
    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        IMAGE_NAME = 'todo-app'
    }
    
    stages {
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    docker-compose build --no-cache
                    docker tag todo-app_backend ${IMAGE_NAME}-backend:latest
                    docker tag todo-app_frontend ${IMAGE_NAME}-frontend:latest
                '''
            }
        }
        
        stage('Start Application for Testing') {
            steps {
                echo '🚀 Starting application...'
                sh '''
                    # Останавливаем старые контейнеры если есть
                    docker-compose down || true
                    
                    # Запускаем приложение
                    docker-compose up -d
                    
                    # Ждем пока приложение запустится
                    echo "Waiting for services to start..."
                    sleep 30
                    
                    # Проверяем, что сервисы работают
                    echo "Checking services..."
                    curl -f http://localhost:5000 || echo "Backend check failed"
                    curl -f http://localhost:80 || echo "Frontend check failed"
                '''
            }
        }
        
        stage('Frontend Playwright Tests') {
            steps {
                echo '🧪 Running Playwright tests...'
                dir('tests') {
                    sh '''
                        # Устанавливаем зависимости Playwright
                        echo "Installing Playwright dependencies..."
                        npm install
                        
                        # Устанавливаем браузеры
                        echo "Installing browsers..."
                        npx playwright install --with-deps chromium
                        
                        # Запускаем тесты
                        echo "Running tests..."
                        npx playwright test --reporter=html
                    '''
                }
            }
            post {
                always {
                    echo '📊 Saving test reports...'
                    sh '''
                        # Сохраняем отчеты тестов
                        mkdir -p playwright-reports
                        cp -r tests/playwright-report/* playwright-reports/ 2>/dev/null || true
                        cp -r tests/test-results/* playwright-reports/ 2>/dev/null || true
                    '''
                    archiveArtifacts artifacts: 'playwright-reports/**/*', allowEmptyArchive: true
                    publishHTML(target: [
                        reportDir: 'tests/playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report'
                    ])
                }
            }
        }
        
        stage('Deploy to Docker') {
            when {
                branch 'main'
            }
            steps {
                echo '🚢 Deploying to production...'
                sh '''
                    # Останавливаем тестовые контейнеры
                    docker-compose down
                    
                    # Запускаем в продакшн режиме
                    docker-compose up -d --build
                    
                    # Проверяем деплой
                    sleep 10
                    echo "Checking deployment..."
                    docker ps | grep todo
                    
                    echo "🌐 Application deployed!"
                    echo "Frontend: http://localhost:80"
                    echo "Backend API: http://localhost:5000"
                '''
            }
            post {
                success {
                    echo '✅ Deployment successful!'
                }
                failure {
                    echo '❌ Deployment failed!'
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            sh '''
                # Останавливаем все контейнеры проекта
                docker-compose down || true
                
                # Удаляем неиспользуемые образы и контейнеры
                docker system prune -f || true
                docker volume prune -f || true
            '''
        }
    }
}