export const formatPersianNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

export const formatTileSize = (widthMm: number, heightMm: number) =>
  `${formatPersianNumber(widthMm / 10)} × ${formatPersianNumber(heightMm / 10)} سانتی‌متر`

export const normalizeEmail = (email: string) => email.trim().toLowerCase()
