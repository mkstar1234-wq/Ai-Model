import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER UNCAUGHT:', error.message));

  console.log('Navigating...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log('Testing App...');
  const chatButton = await page.getByRole('button', { name: 'Start Chatting' });
  await chatButton.click();
  await page.waitForTimeout(1000);
  
  const input = await page.getByPlaceholder('Ask anything...');
  await input.fill('Hello');
  const sendButton = await page.locator('button[type="submit"]');
  await sendButton.click();
  
  await page.waitForTimeout(3000);
  
  await browser.close();
  console.log('Done.');
})();
