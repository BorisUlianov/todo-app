from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import json
import os

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

# Файл для хранения данных
DATA_FILE = 'todos.json'

def load_todos():
    """Загружает задачи из файла"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_todos(todos):
    """Сохраняет задачи в файл"""
    with open(DATA_FILE, 'w') as f:
        json.dump(todos, f, indent=2)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Возвращает список всех задач"""
    todos = load_todos()
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    """Добавляет новую задачу"""
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    todos = load_todos()
    new_id = max([t['id'] for t in todos], default=0) + 1
    new_todo = {
        'id': new_id,
        'title': data['title'],
        'completed': False
    }
    todos.append(new_todo)
    save_todos(todos)
    
    return jsonify(new_todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Удаляет задачу по ID"""
    todos = load_todos()
    filtered_todos = [t for t in todos if t['id'] != todo_id]
    
    if len(filtered_todos) == len(todos):
        return jsonify({'error': 'Todo not found'}), 404
    
    save_todos(filtered_todos)
    return jsonify({'message': 'Todo deleted'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка здоровья приложения"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    # Запускаем на всех интерфейсах, порт 5050
    app.run(host='0.0.0.0', port=5050, debug=True)