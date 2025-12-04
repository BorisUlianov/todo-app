const { test, expect } = require('@playwright/test');

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ждем загрузки
    await page.waitForLoadState('networkidle');
  });

  test('should display correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Todo List App|My Todo List/);
  });

  test('should have main UI elements', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#todo-input')).toBeVisible();
    await expect(page.locator('#add-btn')).toBeVisible();
    await expect(page.locator('#todo-list')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const testTask = 'Buy groceries for dinner';
    
    // Вводим и добавляем задачу
    await page.fill('#todo-input', testTask);
    await page.click('#add-btn');
    
    // Проверяем, что задача появилась
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText(testTask);
  });

  test('should mark todo as completed', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Task to complete');
    await page.click('#add-btn');
    
    // Отмечаем как выполненную
    await page.click('.toggle-btn');
    
    // Проверяем стиль выполненной задачи
    await expect(page.locator('.todo-item.completed')).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Task to delete');
    await page.click('#add-btn');
    
    // Подтверждаем диалог удаления
    page.on('dialog', dialog => dialog.accept());
    
    // Удаляем задачу
    await page.click('.delete-btn');
    
    // Проверяем, что список пуст
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('should update task counter', async ({ page }) => {
    // Проверяем начальный счетчик
    await expect(page.locator('#total-count')).toContainText('0 tasks');
    
    // Добавляем первую задачу
    await page.fill('#todo-input', 'Task 1');
    await page.click('#add-btn');
    await expect(page.locator('#total-count')).toContainText('1 task');
    
    // Добавляем вторую задачу
    await page.fill('#todo-input', 'Task 2');
    await page.click('#add-btn');
    await expect(page.locator('#total-count')).toContainText('2 tasks');
  });

  test('should not add empty todo', async ({ page }) => {
    // Пытаемся добавить пустую задачу
    const initialCount = await page.locator('.todo-item').count();
    await page.fill('#todo-input', '   ');
    await page.click('#add-btn');
    
    // Проверяем, что количество не изменилось
    const finalCount = await page.locator('.todo-item').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should test backend connectivity', async ({ request }) => {
    // Проверяем API бэкенда
    const response = await request.get('http://localhost:5001/api/todos');
    expect(response.ok()).toBeTruthy();
    
    const todos = await response.json();
    expect(Array.isArray(todos)).toBeTruthy();
  });
});