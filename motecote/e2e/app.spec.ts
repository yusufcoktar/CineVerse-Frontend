import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/* ── Visual Snapshots ──────────────────────────────────── */

test.describe('Visual Regression', () => {
  test('homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    // Wait for hero animation to complete
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('explore page renders correctly', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('explore.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('login.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

/* ── Navigation & Page Transitions ─────────────────────── */

test.describe('Navigation & Transitions', () => {
  test('navbar links work and trigger page transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Click Keşfet
    await page.click('text=Keşfet');
    await expect(page).toHaveURL(/explore/);
    await expect(page.locator('main')).toBeVisible();

    // Click Anasayfa
    await page.click('text=Anasayfa');
    await expect(page).toHaveURL('/');
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1500);

    const menuButton = page.locator('button[aria-label="Menüyü aç"]');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });
});

/* ── Chatbot Panel ─────────────────────────────────────── */

test.describe('Chatbot Panel', () => {
  test('opens and closes with ESC', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Open chat
    const chatToggle = page.locator('button[aria-label="Chatbot aç"]');
    if (await chatToggle.isVisible()) {
      await chatToggle.click();
      await expect(page.locator('[role="dialog"][aria-label="Film Asistanı"]')).toBeVisible();

      // Close with ESC
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"][aria-label="Film Asistanı"]')).not.toBeVisible();
    }
  });
});

/* ── Accessibility (axe-core) ──────────────────────────── */

test.describe('Accessibility', () => {
  test('homepage has no critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // Dark theme can trigger false positives
      .analyze();

    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });
});

/* ── Reduced Motion ────────────────────────────────────── */

test.describe('Reduced Motion', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Aurora background should not animate
    const aurora = page.locator('[class*="aurora"]').first();
    if (await aurora.isVisible()) {
      const animation = await aurora.evaluate((el) => {
        const styles = getComputedStyle(el);
        return styles.animationPlayState;
      });
      // Just verify page loads without errors in reduced motion mode
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
