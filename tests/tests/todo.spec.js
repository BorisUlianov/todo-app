const { test, expect } = require('@playwright/test');

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Используем внутренний адрес контейнера
    await page.goto('http://todo-frontend:80');
    // Ждем полной загрузки
    await page.waitForLoadState('networkidle');
  });

  test('should display correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Todo List App');
  });

  test('should have main UI elements', async ({ page }) => {
    // Даем время на загрузку JavaScript
    await page.waitForTimeout(1000);
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#todo-input')).toBeVisible();
    await expect(page.locator('#add-btn')).toBeVisible();
    
    // #todo-list должен быть видимым (может быть пустым)
    const todoList = page.locator('#todo-list');
    await expect(todoList).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const testTask = 'Buy groceries for dinner';
    
    // Вводим и добавляем задачу
    await page.fill('#todo-input', testTask);
    await page.click('#add-btn');
    
    // Ждем обновления
    await page.waitForTimeout(2000);
    
    // Проверяем, что задача появилась
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText(testTask);
  });

  test('should mark todo as completed', async ({ page }) => {
    // Сначала добавляем задачу
    await page.fill('#todo-input', 'Task to complete');
    await page.click('#add-btn');
    await page.waitForTimeout(2000);
    
    // Отмечаем как выполненную
    await page.click('.toggle-btn');
    await page.waitForTimeout(1000);
    
    // Проверяем стиль выполненной задачи
    await expect(page.locator('.todo-item.completed')).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Task to delete');
    await page.click('#add-btn');
    await page.waitForTimeout(3000); // Увеличиваем таймаут
    
    // Проверяем, что задача добавилась
    await expect(page.locator('.todo-item')).toHaveCount(1);
    
    // Подтверждаем диалог удаления
    page.on('dialog', dialog => dialog.accept());
    
    // Удаляем задачу
    await page.click('.delete-btn');
    await page.waitForTimeout(3000); // Ждем удаления
    
    // Проверяем, что список пуст ИЛИ показывает сообщение "No tasks yet"
    const todoItems = await page.locator('.todo-item:not(.empty):not(.error)').count();
    const emptyMessage = await page.locator('#todo-list .empty').count();
    
    expect(todoItems).toBe(0);
});

test('should update task counter', async ({ page }) => {
    // Очищаем все задачи перед тестом
    await page.reload(); // Перезагружаем страницу для чистого состояния
    await page.waitForTimeout(2000);
    
    // Проверяем начальный счетчик (может быть не 0 если остались задачи)
    const initialCounter = await page.locator('#total-count').textContent();
    console.log('Initial counter:', initialCounter);
    
    // Если есть задачи, удаляем их
    const initialItems = await page.locator('.todo-item:not(.empty):not(.error)').count();
    if (initialItems > 0) {
        page.on('dialog', dialog => dialog.accept());
        for (let i = 0; i < initialItems; i++) {
            await page.click('.delete-btn').catch(() => {});
            await page.waitForTimeout(1000);
        }
        await page.reload();
        await page.waitForTimeout(2000);
    }
    
    // Теперь счетчик должен быть 0
    await expect(page.locator('#total-count')).toContainText('0 tasks');
    
    // Добавляем первую задачу
    await page.fill('#todo-input', 'Task 1');
    await page.click('#add-btn');
    await page.waitForTimeout(3000);
    
    // Проверяем счетчик - используем регулярное выражение для гибкости
    await expect(page.locator('#total-count')).toContainText(/1 task/);
    
    // Добавляем вторую задачу
    await page.fill('#todo-input', 'Task 2');
    await page.click('#add-btn');
    await page.waitForTimeout(3000);
    
    // Проверяем счетчик
    await expect(page.locator('#total-count')).toContainText(/2 tasks/);
});


  test('should not add empty todo', async ({ page }) => {
    // Пытаемся добавить пустую задачу
    const initialCount = await page.locator('.todo-item').count();
    await page.fill('#todo-input', '   ');
    await page.click('#add-btn');
    await page.waitForTimeout(1000);
    
    // Проверяем, что количество не изменилось
    const finalCount = await page.locator('.todo-item').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should test backend connectivity', async ({ request }) => {
    // Проверяем API бэкенда через внутренний адрес
    const response = await request.get('http://todo-backend:5000/api/todos');
    expect(response.ok()).toBeTruthy();
    
    const todos = await response.json();
    expect(Array.isArray(todos)).toBeTruthy();
  });
});