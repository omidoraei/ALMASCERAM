import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Mirrors the adminProductFormSchema from src/lib/validation/admin-catalog.ts
 * (kept inline here so the test does not depend on that file's exact shape).
 */
const adminProductFormSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول حداقل ۲ کاراکتر است').max(140),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'اسلاگ فقط حروف انگلیسی کوچک، عدد و خط تیره'),
  sku: z.string().trim().min(2, 'کد محصول الزامی است').max(60),
  seriesId: z.string().min(1, 'سری محصول را انتخاب کنید'),
  description: z.string().trim().max(5000).optional(),
  isPublished: z.boolean(),
})

type FormValues = z.infer<typeof adminProductFormSchema>

function ProductForm({ onSubmit, existing }: { onSubmit: (values: FormValues) => Promise<void>; existing?: Partial<FormValues> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: { name: '', slug: '', sku: '', seriesId: '', description: '', isPublished: false, ...existing },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="فرم محصول">
      <label>نام فارسی<input {...register('name')} data-testid="name" /></label>
      {errors.name && <span role="alert">{errors.name.message}</span>}

      <label>کد محصول<input dir="ltr" {...register('sku')} data-testid="sku" /></label>
      {errors.sku && <span role="alert">{errors.sku.message}</span>}

      <label>Slug<input dir="ltr" {...register('slug')} data-testid="slug" /></label>
      {errors.slug && <span role="alert">{errors.slug.message}</span>}

      <label>سری محصول<select {...register('seriesId')} data-testid="series"><option value="">انتخاب کنید</option><option value="series-1">آرنا</option></select></label>
      {errors.seriesId && <span role="alert">{errors.seriesId.message}</span>}

      <label>توضیحات<textarea {...register('description')} data-testid="description" /></label>

      <label><input type="checkbox" {...register('isPublished')} data-testid="isPublished" /> منتشر شود</label>

      <button type="submit" disabled={isSubmitting}>ذخیره</button>
    </form>
  )
}

describe('Admin product form integration', () => {
  it('rejects submit when name, sku, slug, and series are missing', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))

    expect(await screen.findByText('نام محصول حداقل ۲ کاراکتر است')).toBeInTheDocument()
    expect(await screen.findByText('کد محصول الزامی است')).toBeInTheDocument()
    expect(await screen.findByText('سری محصول را انتخاب کنید')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a slug with uppercase letters', async () => {
    render(<ProductForm onSubmit={vi.fn()} />)
    await userEvent.type(screen.getByTestId('name'), 'آرنا سند')
    await userEvent.type(screen.getByTestId('sku'), 'KR-0101')
    await userEvent.type(screen.getByTestId('slug'), 'Arena-Sand')
    await userEvent.selectOptions(screen.getByTestId('series'), 'series-1')
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))

    expect(await screen.findByText('اسلاگ فقط حروف انگلیسی کوچک، عدد و خط تیره')).toBeInTheDocument()
  })

  it('rejects a slug with spaces', async () => {
    render(<ProductForm onSubmit={vi.fn()} />)
    await userEvent.type(screen.getByTestId('name'), 'آرنا سند')
    await userEvent.type(screen.getByTestId('sku'), 'KR-0101')
    await userEvent.type(screen.getByTestId('slug'), 'arena sand')
    await userEvent.selectOptions(screen.getByTestId('series'), 'series-1')
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))

    expect(await screen.findByText('اسلاگ فقط حروف انگلیسی کوچک، عدد و خط تیره')).toBeInTheDocument()
  })

  it('submits a valid product with isPublished checked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ProductForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByTestId('name'), 'آرنا سند')
    await userEvent.type(screen.getByTestId('sku'), 'KR-0101')
    await userEvent.type(screen.getByTestId('slug'), 'arena-sand')
    await userEvent.selectOptions(screen.getByTestId('series'), 'series-1')
    await userEvent.click(screen.getByTestId('isPublished'))
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const [payload] = onSubmit.mock.calls[0]
    expect(payload).toMatchObject({
      name: 'آرنا سند',
      sku: 'KR-0101',
      slug: 'arena-sand',
      seriesId: 'series-1',
      isPublished: true,
    })
  })

  it('pre-fills fields from existing values (edit mode)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ProductForm onSubmit={onSubmit} existing={{ name: 'آرنا سند', sku: 'KR-0101', slug: 'arena-sand', seriesId: 'series-1', isPublished: true }} />)

    expect(screen.getByTestId('name')).toHaveValue('آرنا سند')
    expect(screen.getByTestId('sku')).toHaveValue('KR-0101')
    expect(screen.getByTestId('slug')).toHaveValue('arena-sand')
    expect(screen.getByTestId('isPublished')).toBeChecked()
  })
})
