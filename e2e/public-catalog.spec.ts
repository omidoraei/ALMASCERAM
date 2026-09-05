import { test, expect } from '@playwright/test'

/**
 * E2E smoke tests for the public catalog.
 * These run against the Vite preview build with Supabase unconfigured,
 * so they only exercise the demo / no-backend path.
 */

test.describe('Public catalog', () => {
  test('home page renders the brand, hero, and product catalog', async ({ page }) => {
    await page.goto('/')

    // Brand
    await expect(page.getByRole('button', { name: 'صفحه نخست الماس' })).toBeVisible()

    // Hero
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ماندگار شدن')
    await expect(page.getByRole('img', { name: /فضای معماری مدرن/ })).toBeVisible()

    // Catalog heading
    await expect(page.getByRole('heading', { name: 'سطح مناسب پروژه‌تان را پیدا کنید.' })).toBeVisible()
  })

  test('hero image has fetchPriority high and dimensions', async ({ page }) => {
    await page.goto('/')
    const heroImg = page.getByRole('img', { name: /فضای معماری مدرن/ })
    await expect(heroImg).toHaveAttribute('fetchpriority', 'high')
    await expect(heroImg).toHaveAttribute('width', '1200')
    await expect(heroImg).toHaveAttribute('height', '800')
  })

  test('product card images use native lazy loading', async ({ page }) => {
    await page.goto('/')
    const productImages = page.locator('.product-card img')
    const count = await productImages.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(productImages.nth(i)).toHaveAttribute('loading', 'lazy')
      await expect(productImages.nth(i)).toHaveAttribute('decoding', 'async')
    }
  })

  test('admin link points to /admin/login', async ({ page }) => {
    await page.goto('/')
    const adminLink = page.getByRole('link', { name: /ورود به پنل مدیریت/ })
    await expect(adminLink).toHaveAttribute('href', '/admin/login')
  })

  test('account link in admin path lands on the account app', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/account$/)
    // Magic-link form heading should appear once the lazy chunk loads
    await expect(page.getByRole('heading', { name: 'ورود به حساب' })).toBeVisible({ timeout: 10_000 })
  })

  test('magic-link callback shows working state on /auth/callback', async ({ page }) => {
    await page.goto('/auth/callback')
    await expect(page.getByText('MAGIC LINK')).toBeVisible({ timeout: 10_000 })
    // In demo mode (no Supabase) it eventually shows the success state
    await expect(page.getByText('استعلام شما ثبت شد.')).toBeVisible({ timeout: 10_000 })
  })

  test('admin route loads behind the lazy chunk and shows login UI', async ({ page }) => {
    await page.goto('/admin')
    // Suspense fallback is a brief spinner, then admin login appears
    await expect(page.getByRole('heading', { name: 'ورود امن بدون رمز عبور.' })).toBeVisible({ timeout: 10_000 })
    // Demo mode banner
    await expect(page.getByText('نسخه نمایشی')).toBeVisible()
  })

  test('admin login in demo mode accepts any email', async ({ page }) => {
    await page.goto('/admin')
    await page.getByLabel('ایمیل سازمانی').fill('demo@almasceram.ir')
    await page.getByRole('button', { name: /ارسال Magic Link/ }).click()
    // Lands in the admin shell with the demo sidebar
    await expect(page.getByText('پنل مدیریت')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'نمای کلی امروز' })).toBeVisible()
  })
})

test.describe('Inquiry flow', () => {
  test('opening the inquiry drawer and switching steps works', async ({ page }) => {
    await page.goto('/')

    // Click the inquiry button in the header
    await page.getByRole('button', { name: /سبد استعلام/ }).first().click()

    // Empty state of the cart
    await expect(page.getByRole('heading', { name: 'سبد شما خالی است' })).toBeVisible()
  })

  test('adding a product to the inquiry cart updates the badge', async ({ page }) => {
    await page.goto('/')

    const addButtons = page.getByRole('button', { name: /افزودن به استعلام/ })
    const before = await page.getByRole('button', { name: /سبد استعلام/ }).first().textContent()
    await addButtons.first().click()
    const after = await page.getByRole('button', { name: /سبد استعلام/ }).first().textContent()
    // The badge count should change from "0" to "1" (rendered in Persian digits).
    expect(after).not.toEqual(before)
  })
})
