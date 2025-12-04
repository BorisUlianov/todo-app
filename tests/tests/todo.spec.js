const { test, expect } = require('@playwright/test');

test.describe('Todo App Frontend Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Todo List App');
    await expect(page.locator('h1')).toHaveText('My Todo List');
  });

  test('should add a new todo item', async ({ page }) => {
    const todoText = 'Buy groceries';
    
    // Вводим текст
    await page.fill('#todo-input', todoText);
    await page.click('#add-btn');
    
    // Проверяем, что задача появилась
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText(todoText);
  });

  test('should mark todo as completed', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Test task');
    await page.click('#add-btn');
    
    // Отмечаем как выполненную
    await page.click('.toggle-btn');
    
    // Проверяем стиль выполненной задачи
    await expect(page.locator('.todo-item.completed')).toBeVisible();
  });

  test('should delete a todo item', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Task to delete');
    await page.click('#add-btn');
    
    // Удаляем задачу (подтверждаем диалог)
    page.on('dialog', dialog => dialog.accept());
    await page.click('.delete-btn');
    
    // Проверяем, что список пуст
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('should update task counter', async ({ page }) => {
    // Проверяем начальное состояние
    await expect(page.locator('#total-count')).toContainText('0 tasks');
    
    // Добавляем задачу
    await page.fill('#todo-input', 'Task 1');
    await page.click('#add-btn');
    
    // Проверяем счетчик
    await expect(page.locator('#total-count')).toContainText('1 task');
    
    // Добавляем еще одну
    await page.fill('#todo-input', 'Task 2');
    await page.click('#add-btn');
    
    // Проверяем счетчик
    await expect(page.locator('#total-count')).toContainText('2 tasks');
  });
});