pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/BorisUlianov/todo-app.git
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh 'docker-compose down'
                    sh 'docker-compose build --no-cache'
                    sh 'docker-compose up -d'
                }
            }
        }
        
        stage('Test Deployment') {
            steps {
                script {
                    sleep 10  // Ждем запуска
                    sh 'curl -f http://localhost:8080 || exit 1'
                    sh 'curl -f http://localhost:5050/health || exit 1'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            echo 'Frontend: http://localhost:8080'
            echo 'Backend API: http://localhost:5050/api/todos'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}