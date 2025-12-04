import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_todos_empty(client):
    """Тест получения пустого списка задач"""
    response = client.get('/api/todos')
    assert response.status_code == 200
    assert response.json == []

def test_add_todo(client):
    """Тест добавления задачи"""
    response = client.post('/api/todos', 
                          json={'title': 'Test task'})
    assert response.status_code == 201
    assert 'id' in response.json
    assert response.json['title'] == 'Test task'
    assert response.json['completed'] == False

def test_delete_todo(client):
    """Тест удаления задачи"""
    # Сначала добавляем задачу
    add_response = client.post('/api/todos', 
                              json={'title': 'To delete'})
    todo_id = add_response.json['id']
    
    # Удаляем задачу
    delete_response = client.delete(f'/api/todos/{todo_id}')
    assert delete_response.status_code == 200
    
    # Проверяем, что задача удалена
    get_response = client.get('/api/todos')
    assert len(get_response.json) == 0