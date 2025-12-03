from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import json
import os

app = Flask(__name__)
CORS(app)  # Разрешаем запросы из браузера

# Простое хранение в файле (для демо)
DATA_FILE = 'todos.json'

def load_todos():
    """Загружает задачи из файла"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_todos(todos):
    """Сохраняет задачи в файл"""
    with open(DATA_FILE, 'w') as f:
        json.dump(todos, f, indent=2)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Возвращает все задачи"""
    todos = load_todos()
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    """Добавляет новую задачу"""
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Необходим заголовок задачи'}), 400
        
        todos = load_todos()
        
        # Генерируем ID
        new_id = 1
        if todos:
            new_id = max([t['id'] for t in todos]) + 1
        
        new_todo = {
            'id': new_id,
            'title': data['title'],
            'completed': False
        }
        
        todos.append(new_todo)
        save_todos(todos)
        
        return jsonify(new_todo), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Удаляет задачу"""
    try:
        todos = load_todos()
        new_todos = [t for t in todos if t['id'] != todo_id]
        
        if len(new_todos) == len(todos):
            return jsonify({'error': 'Задача не найдена'}), 404
        
        save_todos(new_todos)
        return jsonify({'message': 'Задача удалена'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Проверка здоровья приложения"""
    return jsonify({
        'status': 'healthy',
        'service': 'todo-backend',
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    # ВНИМАНИЕ: Запускаем на всех интерфейсах, чтобы nginx мог подключиться
    app.run(host='0.0.0.0', port=5000, debug=False)