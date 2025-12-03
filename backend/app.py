# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Разрешаем CORS

DATA_FILE = 'todos.json'

def load_todos():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_todos(todos):
    with open(DATA_FILE, 'w') as f:
        json.dump(todos, f, indent=2)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    return jsonify(load_todos())

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title required'}), 400
    
    todos = load_todos()
    new_id = max([t['id'] for t in todos], default=0) + 1
    new_todo = {'id': new_id, 'title': data['title'], 'completed': False}
    todos.append(new_todo)
    save_todos(todos)
    return jsonify(new_todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todos = load_todos()
    new_todos = [t for t in todos if t['id'] != todo_id]
    
    if len(new_todos) == len(todos):
        return jsonify({'error': 'Not found'}), 404
    
    save_todos(new_todos)
    return jsonify({'message': 'Deleted'}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'todo-backend'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=False)