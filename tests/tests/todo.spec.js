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
    await page.waitForTimeout(2000);
    
    // Подтверждаем диалог удаления
    page.on('dialog', dialog => dialog.accept());
    
    // Удаляем задачу
    await page.click('.delete-btn');
    await page.waitForTimeout(2000);
    
    // Проверяем, что список пуст или показывает сообщение
    const todoItems = await page.locator('.todo-item').count();
    const emptyMessage = await page.locator('#todo-list .empty').count();
    
    expect(todoItems === 0 || emptyMessage > 0).toBeTruthy();
  });

  test('should update task counter', async ({ page }) => {
    // Проверяем начальный счетчик
    await expect(page.locator('#total-count')).toContainText('0 tasks');
    
    // Добавляем первую задачу
    await page.fill('#todo-input', 'Task 1');
    await page.click('#add-btn');
    await page.waitForTimeout(2000);
    
    // Проверяем счетчик
    const counterText = await page.locator('#total-count').textContent();
    expect(counterText).toMatch(/1 task/);
    
    // Добавляем вторую задачу
    await page.fill('#todo-input', 'Task 2');
    await page.click('#add-btn');
    await page.waitForTimeout(2000);
    
    // Проверяем счетчик
    const finalCounter = await page.locator('#total-count').textContent();
    expect(finalCounter).toMatch(/2 tasks/);
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