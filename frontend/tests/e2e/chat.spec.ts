import { test, expect } from '@playwright/test';

test.describe('Medical Clinic Chat - Core E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test.describe('Core Functionality', () => {
    test('should load the chat interface', async ({ page }) => {
      // Check main elements are present
      await expect(page.getByText('ClinicChat')).toBeVisible();
      await expect(page.getByText('[Chat messages will appear here]')).toBeVisible();
      await expect(page.getByPlaceholder('Type your message...')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Select language' })).toBeVisible();
    });

    test('should have proper page title', async ({ page }) => {
      await expect(page).toHaveTitle(/Medical Clinic Chat|ClinicChat/);
    });

    test('should enable send button when typing', async ({ page }) => {
      const input = page.getByPlaceholder('Type your message...');
      const sendButton = page.getByRole('button', { name: 'Send' });
      
      // Initially disabled
      await expect(sendButton).toBeDisabled();
      
      // Enabled when typing
      await input.fill('Hello');
      await expect(sendButton).toBeEnabled();
      
      // Disabled when empty
      await input.fill('');
      await expect(sendButton).toBeDisabled();
    });

    test('should send and receive messages', async ({ page }) => {
      const input = page.getByPlaceholder('Type your message...');
      const sendButton = page.getByRole('button', { name: 'Send' });
      
      // Type and send a message
      await input.fill('Hello, I need help');
      await sendButton.click();
      
      // Check user message appears
      await expect(page.getByText('Hello, I need help')).toBeVisible();
      
      // Check input is cleared
      await expect(input).toHaveValue('');
      
      // Wait for bot response (with generous timeout)
      await expect(page.locator('.chat-bubble.bot')).toBeVisible({ timeout: 30000 });
      
      // Check that placeholder is gone
      await expect(page.getByText('[Chat messages will appear here]')).not.toBeVisible();
    });

    test('should send message using Enter key', async ({ page }) => {
      const input = page.getByPlaceholder('Type your message...');
      
      await input.fill('Hello from keyboard');
      await input.press('Enter');
      
      // Check message was sent
      await expect(page.getByText('Hello from keyboard')).toBeVisible();
      await expect(input).toHaveValue('');
    });
  });

  test.describe('Language Switching', () => {
    test('should switch to Sinhala', async ({ page }) => {
      const languageSelect = page.getByRole('combobox', { name: 'Select language' });
      
      await languageSelect.selectOption('si');
      await expect(languageSelect).toHaveValue('si');
    });

    test('should remember language selection after reload', async ({ page }) => {
      const languageSelect = page.getByRole('combobox', { name: 'Select language' });
      
      // Switch to Sinhala
      await languageSelect.selectOption('si');
      await expect(languageSelect).toHaveValue('si');
      
      // Refresh page
      await page.reload();
      
      // Language should still be selected
      await expect(languageSelect).toHaveValue('si');
    });
  });

  test.describe('Basic Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // All elements should still be visible and functional
      await expect(page.getByText('ClinicChat')).toBeVisible();
      await expect(page.getByPlaceholder('Type your message...')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
      
      // Should be able to send messages
      const input = page.getByPlaceholder('Type your message...');
      const sendButton = page.getByRole('button', { name: 'Send' });
      
      await input.fill('Mobile test');
      await sendButton.click();
      
      await expect(page.getByText('Mobile test')).toBeVisible();
    });
  });

  test.describe('Basic Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.getByRole('combobox', { name: 'Select language' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Type your message...' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    });
  });

  test.describe('Medical Context', () => {
    test('should handle medical appointment requests', async ({ page }) => {
      const input = page.getByPlaceholder('Type your message...');
      const sendButton = page.getByRole('button', { name: 'Send' });
      
      await input.fill('I need to schedule a dental appointment');
      await sendButton.click();
      
      await expect(page.getByText('I need to schedule a dental appointment')).toBeVisible();
      
      // Wait for medical context response
      await expect(page.locator('.chat-bubble.bot')).toBeVisible({ timeout: 30000 });
    });
  });
}); 