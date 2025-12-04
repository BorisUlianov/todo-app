pipeline {
    agent any
    
    environment {
        // Указываем переменные окружения
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        DOCKER_REGISTRY = 'your-registry' // Если используете Docker Registry
        IMAGE_NAME = 'todo-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out source code...'
                git branch: 'main', 
                    url: 'https://github.com/your-username/todo-app.git',
                    credentialsId: 'github-credentials'
            }
        }
        
        stage('Backend Unit Tests') {
            steps {
                echo '🧪 Running backend unit tests...'
                dir('backend') {
                    sh '''
                        docker build -t todo-backend-test -f Dockerfile .
                        docker run --rm todo-backend-test python -m pytest test_app.py -v
                    '''
                }
            }
            post {
                failure {
                    echo '❌ Backend tests failed!'
                    // Можно добавить уведомление
                }
                success {
                    echo '✅ Backend tests passed!'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    docker-compose build
                    docker tag todo-app_backend ${IMAGE_NAME}-backend:latest
                    docker tag todo-app_frontend ${IMAGE_NAME}-frontend:latest
                '''
            }
        }
        
        stage('Run Integration Tests') {
            steps {
                echo '🚀 Starting application for integration tests...'
                sh 'docker-compose up -d'
                
                script {
                    // Ждем пока приложение запустится
                    sleep 30
                    
                    echo '🧪 Running Playwright tests...'
                    dir('tests') {
                        // Устанавливаем зависимости и браузеры
                        sh 'npm install'
                        sh 'npx playwright install --with-deps'
                        
                        // Запускаем тесты
                        sh 'npx playwright test --reporter=html'
                    }
                }
            }
            post {
                always {
                    echo '🛑 Stopping application...'
                    sh 'docker-compose down'
                    
                    // Сохраняем отчеты тестов
                    archiveArtifacts artifacts: 'tests/playwright-report/**/*', 
                                    allowEmptyArchive: true
                }
            }
        }
        
        stage('Deploy to Docker') {
            when {
                branch 'main'
            }
            steps {
                echo '🚢 Deploying to Docker...'
                sh '''
                    docker-compose up -d --build
                    
                    # Проверяем, что контейнеры работают
                    sleep 10
                    docker ps | grep todo
                    
                    # Логинимся в Docker Registry (если используется)
                    # echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                    # docker push ${IMAGE_NAME}-backend:latest
                    # docker push ${IMAGE_NAME}-frontend:latest
                '''
            }
            post {
                success {
                    echo '✅ Deployment successful!'
                    echo '🌐 Application is running at: http://localhost:80'
                    echo '🔧 Backend API: http://localhost:5000'
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
            // Очищаем Docker
            sh '''
                docker system prune -f || true
                docker volume prune -f || true
            '''
            
            // Отправляем уведомление
            emailext (
                subject: "[${currentBuild.result}] Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Check console output at: ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}