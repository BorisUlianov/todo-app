const { test, expect } = require('@playwright/test');

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу перед каждым тестом
    await page.goto('/');
  });

  test('should load the page correctly', async ({ page }) => {
    // Проверяем заголовок
    await expect(page.locator('h1')).toHaveText('My Todo List');
    
    // Проверяем наличие формы
    await expect(page.locator('#todo-input')).toBeVisible();
    await expect(page.locator('#add-btn')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    // Вводим новую задачу
    const todoText = 'Buy groceries';
    await page.fill('#todo-input', todoText);
    await page.click('#add-btn');
    
    // Проверяем, что задача добавилась
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem).toContainText(todoText);
    
    // Проверяем статистику
    await expect(page.locator('#total-count')).toContainText('1 task');
  });

  test('should mark todo as completed', async ({ page }) => {
    // Сначала добавляем задачу
    await page.fill('#todo-input', 'Test task');
    await page.click('#add-btn');
    
    // Отмечаем как выполненную
    await page.click('.toggle-btn');
    
    // Проверяем, что задача помечена как выполненная
    await expect(page.locator('.todo-item.completed')).toBeVisible();
    await expect(page.locator('#completed-count')).toContainText('1 completed');
  });

  test('should delete a todo', async ({ page }) => {
    // Добавляем задачу
    await page.fill('#todo-input', 'Task to delete');
    await page.click('#add-btn');
    
    // Проверяем, что задача есть
    await expect(page.locator('.todo-item')).toHaveCount(1);
    
    // Удаляем задачу
    page.on('dialog', dialog => dialog.accept()); // Принимаем confirm
    await page.click('.delete-btn');
    
    // Проверяем, что задача удалена
    await expect(page.locator('.todo-item')).toHaveCount(0);
    await expect(page.locator('#total-count')).toContainText('0 tasks');
  });

  test('should not add empty todo', async ({ page }) => {
    // Пытаемся добавить пустую задачу
    await page.fill('#todo-input', '   ');
    await page.click('#add-btn');
    
    // Проверяем, что задача не добавилась
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('should update statistics correctly', async ({ page }) => {
    // Добавляем несколько задач
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    
    for (const task of tasks) {
      await page.fill('#todo-input', task);
      await page.click('#add-btn');
      await page.waitForTimeout(300); // Небольшая задержка
    }
    
    // Проверяем общее количество
    await expect(page.locator('#total-count')).toContainText('3 tasks');
    
    // Отмечаем одну как выполненную
    await page.locator('.toggle-btn').first().click();
    
    // Проверяем количество выполненных
    await expect(page.locator('#completed-count')).toContainText('1 completed');
  });
});