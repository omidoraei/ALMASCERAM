import { test, expect } from '@playwright/test'

/**
 * Responsive + theme-toggle smoke tests. They run against the Vite
 * preview build; the theme starts in "light" because we have not set
 * `prefers-color-scheme: dark` in the Playwright context.
 */

test.describe('Responsive layout', () => {
  test('desktop (1280×800) shows the desktop navigation and 4-column product grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'ناوبری اصلی' })).toBeVisible()
    const products = page.locator('.product-card')
    expect(await products.count()).toBeGreaterThan(0)
  })

  test('tablet (820×1180) collapses the product grid to 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 })
    await page.goto('/')
    // The 1024px breakpoint triggers 2-column grid
    const firstProduct = page.locator('.product-card').first()
    await expect(firstProduct).toBeVisible()
  })

  test('mobile (375×667) hides the desktop nav and shows the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'نمایش منو' })).toBeVisible()
    // Inquiry cart button should still be visible
    await expect(page.getByRole('button', { name: /سبد استعلام/ }).first()).toBeVisible()
  })

  test('very narrow (320×568) still loads without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    // body min-width is 320, so the page should not introduce horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Theme toggle', () => {
  test('clicking the theme toggle switches the data-theme attribute', async ({ page }) => {
    await page.goto('/')
    const initial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(initial).toBe('light')
    await page.getByRole('button', { name: /تغییر به حالت تاریک/ }).click()
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(after).toBe('dark')
    await page.getByRole('button', { name: /تغییر به حالت روشن/ }).click()
    const reverted = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(reverted).toBe('light')
  })

  test('the selected theme persists across page reloads', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /تغییر به حالت تاریک/ }).click()
    await page.reload()
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('dark')
  })

  test('the theme toggle respects prefers-color-scheme on first load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('dark')
  })
})
