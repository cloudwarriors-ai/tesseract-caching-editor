import { test, expect } from '@playwright/test';

test('Debug: Check what loads on the page', async ({ page }) => {
  console.log('🔍 Navigating to test.html...');
  
  // Navigate to the page
  await page.goto('/test.html');
  
  // Wait a bit for any JS to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot to see what's actually loaded
  await page.screenshot({ path: 'debug-screenshots/page-load.png', fullPage: true });
  
  // Get the page title
  const title = await page.title();
  console.log('📄 Page title:', title);
  
  // Check if there are any console errors
  page.on('console', msg => console.log('🖥️ Console:', msg.text()));
  page.on('pageerror', error => console.log('❌ Page error:', error.message));
  
  // Check what elements are actually present
  const bodyContent = await page.locator('body').innerHTML();
  console.log('📝 Body content length:', bodyContent.length);
  
  // Check for specific elements
  const elements = [
    '#root',
    '.container', 
    '.sidebar',
    '.loading',
    '.error'
  ];
  
  for (const selector of elements) {
    const element = page.locator(selector);
    const count = await element.count();
    const visible = count > 0 ? await element.first().isVisible() : false;
    console.log(`${visible ? '✅' : '❌'} ${selector}: ${count} found, ${visible ? 'visible' : 'not visible'}`);
    
    if (count > 0) {
      const text = await element.first().textContent();
      if (text && text.length < 200) {
        console.log(`   Text: "${text.trim()}"`);
      }
    }
  }
  
  // Check if React loaded
  const reactExists = await page.evaluate(() => typeof window.React !== 'undefined');
  console.log('⚛️ React loaded:', reactExists);
  
  // Check if ReactQuery loaded  
  const reactQueryExists = await page.evaluate(() => typeof window.ReactQuery !== 'undefined');
  console.log('🔄 ReactQuery loaded:', reactQueryExists);
  
  // Check for network requests
  const responses: string[] = [];
  page.on('response', response => {
    responses.push(`${response.status()} ${response.url()}`);
  });
  
  await page.waitForTimeout(2000);
  console.log('🌐 Network responses:');
  responses.forEach(r => console.log('  ', r));
});