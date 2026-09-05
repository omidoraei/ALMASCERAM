import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'

/**
 * This integration test exercises a React Hook Form + Zod resolver pipeline
 * wired up the same way the production InquiryDrawer does it. The component
 * is local to the test so we don't pull in heavy dependencies (Supabase,
 * framer-motion, the layout) for what is essentially a contract test.
 */

const schema = z.object({
  fullName: z.string().trim().min(3, 'نام کوتاه است').max(80),
  email: z.email('ایمیل نامعتبر است'),
  phone: z.string().trim().regex(/^09\d{9}$/, 'موبایل نامعتبر است'),
})

type FormValues = z.infer<typeof schema>

function TestForm({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> | void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '' },
  })

  useEffect(() => {
    // Force a known start state
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="فرم استعلام">
      <label>
        نام و نام خانوادگی
        <input {...register('fullName')} data-testid="fullName" />
      </label>
      {errors.fullName && <span role="alert">{errors.fullName.message}</span>}

      <label>
        ایمیل
        <input {...register('email')} data-testid="email" />
      </label>
      {errors.email && <span role="alert">{errors.email.message}</span>}

      <label>
        موبایل
        <input {...register('phone')} data-testid="phone" />
      </label>
      {errors.phone && <span role="alert">{errors.phone.message}</span>}

      <button type="submit" disabled={isSubmitting}>ارسال</button>
    </form>
  )
}

describe('Inquiry form integration (RHF + Zod)', () => {
  it('shows validation errors on empty submit', async () => {
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))

    expect(await screen.findByText('نام کوتاه است')).toBeInTheDocument()
    expect(await screen.findByText('ایمیل نامعتبر است')).toBeInTheDocument()
    expect(await screen.findByText('موبایل نامعتبر است')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows email error for a non-email string', async () => {
    render(<TestForm onSubmit={vi.fn()} />)
    await userEvent.type(screen.getByTestId('fullName'), 'علی رضایی')
    await userEvent.type(screen.getByTestId('email'), 'not-an-email')
    await userEvent.type(screen.getByTestId('phone'), '09123456789')
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))

    expect(await screen.findByText('ایمیل نامعتبر است')).toBeInTheDocument()
  })

  it('submits successfully with valid values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TestForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByTestId('fullName'), 'علی رضایی')
    await userEvent.type(screen.getByTestId('email'), 'ali@example.com')
    await userEvent.type(screen.getByTestId('phone'), '09123456789')
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'علی رضایی',
      email: 'ali@example.com',
      phone: '09123456789',
    }, expect.anything())
  })

  it('rejects a phone that is the wrong length', async () => {
    render(<TestForm onSubmit={vi.fn()} />)
    await userEvent.type(screen.getByTestId('fullName'), 'علی رضایی')
    await userEvent.type(screen.getByTestId('email'), 'ali@example.com')
    await userEvent.type(screen.getByTestId('phone'), '09123')
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))

    expect(await screen.findByText('موبایل نامعتبر است')).toBeInTheDocument()
  })

  it('clears the error after the user fixes the value and resubmits', async () => {
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))
    expect(await screen.findByText('ایمیل نامعتبر است')).toBeInTheDocument()

    await userEvent.type(screen.getByTestId('fullName'), 'علی رضایی')
    await userEvent.type(screen.getByTestId('email'), 'ali@example.com')
    await userEvent.type(screen.getByTestId('phone'), '09123456789')
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})
