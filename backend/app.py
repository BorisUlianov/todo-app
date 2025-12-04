from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Разрешаем запросы от фронтенда

# Вместо базы данных используем список в памяти для простоты
todos = []
next_id = 1

@app.route('/')
def home():
    return jsonify({"message": "Todo API is running!"})

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Получить все задачи"""
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    """Добавить новую задачу"""
    global next_id
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    todo = {
        "id": next_id,
        "title": data['title'],
        "completed": False
    }
    
    todos.append(todo)
    next_id += 1
    return jsonify(todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Удалить задачу"""
    global todos
    initial_length = len(todos)
    todos = [todo for todo in todos if todo['id'] != todo_id]
    
    if len(todos) < initial_length:
        return jsonify({"message": "Todo deleted"}), 200
    else:
        return jsonify({"error": "Todo not found"}), 404

@app.route('/api/todos/<int:todo_id>/toggle', methods=['PUT'])
def toggle_todo(todo_id):
    """Переключить статус выполнения"""
    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            return jsonify(todo), 200
    return jsonify({"error": "Todo not found"}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)