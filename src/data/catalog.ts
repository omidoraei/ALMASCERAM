import type { Product } from '../types/catalog'

const size120 = { id: '120-240', label: '۱۲۰ × ۲۴۰', widthMm: 1200, heightMm: 2400, thicknessMm: 9, faces: 6, weightKg: 56.2 }
const size80 = { id: '80-160', label: '۸۰ × ۱۶۰', widthMm: 800, heightMm: 1600, thicknessMm: 9, faces: 8, weightKg: 25.4 }
const size60 = { id: '60-120', label: '۶۰ × ۱۲۰', widthMm: 600, heightMm: 1200, thicknessMm: 9, faces: 12, weightKg: 14.3 }
const size100 = { id: '100-100', label: '۱۰۰ × ۱۰۰', widthMm: 1000, heightMm: 1000, thicknessMm: 9, faces: 10, weightKg: 19.8 }

export const products: Product[] = [
  {
    id: 'arena-sand', name: 'آرنا سند', englishName: 'ARENA SAND', slug: 'arena-sand', series: 'آرنا', collection: 'زمین', category: 'سنگ', finish: 'مات',
    applications: ['کف', 'دیوار', 'فضای تجاری'], image: '/images/products/tile-arena.svg', tone: '#c8bba5', badge: 'جدید', sizes: [size120, size80, size60],
    technical: { waterAbsorption: 'کمتر از ۰٫۵٪', breakingStrength: 'بیش از ۱۳۰۰ نیوتن', abrasionResistance: 'کلاس PEI IV', frostResistance: 'مقاوم', shadeVariation: 'V2 — تغییرات جزئی' },
  },
  {
    id: 'urban-grey', name: 'اوربان گری', englishName: 'URBAN GREY', slug: 'urban-grey', series: 'اوربان', collection: 'معماری', category: 'بتن', finish: 'مات',
    applications: ['کف', 'دیوار', 'فضای بیرونی'], image: '/images/products/tile-concrete.svg', tone: '#8d8c88', sizes: [size120, size100, size60],
    technical: { waterAbsorption: 'کمتر از ۰٫۵٪', breakingStrength: 'بیش از ۱۴۰۰ نیوتن', abrasionResistance: 'کلاس PEI V', frostResistance: 'مقاوم', shadeVariation: 'V3 — تغییرات متوسط' },
  },
  {
    id: 'calacatta-oro', name: 'کلکته اورو', englishName: 'CALACATTA ORO', slug: 'calacatta-oro', series: 'کلکته', collection: 'میراث', category: 'مرمر', finish: 'پولیش',
    applications: ['دیوار', 'کف', 'فضای لوکس'], image: '/images/products/tile-calacatta.svg', tone: '#dedbd3', badge: 'پرفروش', sizes: [size120, size80],
    technical: { waterAbsorption: 'کمتر از ۰٫۳٪', breakingStrength: 'بیش از ۱۳۰۰ نیوتن', abrasionResistance: 'کلاس PEI III', frostResistance: 'مقاوم', shadeVariation: 'V2 — تغییرات جزئی' },
  },
  {
    id: 'noir-stone', name: 'نوآر استون', englishName: 'NOIR STONE', slug: 'noir-stone', series: 'نوآر', collection: 'مونوکروم', category: 'سنگ', finish: 'ساختار‌دار',
    applications: ['نما', 'دیوار', 'فضای تجاری'], image: '/images/products/tile-noir.svg', tone: '#343432', sizes: [size80, size60, size100],
    technical: { waterAbsorption: 'کمتر از ۰٫۵٪', breakingStrength: 'بیش از ۱۵۰۰ نیوتن', abrasionResistance: 'کلاس PEI IV', frostResistance: 'کاملاً مقاوم', shadeVariation: 'V3 — تغییرات متوسط' },
  },
  {
    id: 'travertine-light', name: 'تراورتن لایت', englishName: 'TRAVERTINE LIGHT', slug: 'travertine-light', series: 'تراورتن', collection: 'زمین', category: 'تراورتن', finish: 'مات',
    applications: ['کف', 'دیوار', 'نما'], image: '/images/products/tile-arena.svg', tone: '#cfc1ab', sizes: [size120, size80, size60],
    technical: { waterAbsorption: 'کمتر از ۰٫۵٪', breakingStrength: 'بیش از ۱۳۵۰ نیوتن', abrasionResistance: 'کلاس PEI IV', frostResistance: 'مقاوم', shadeVariation: 'V3 — تغییرات متوسط' },
  },
  {
    id: 'cement-silver', name: 'سمنت سیلور', englishName: 'CEMENT SILVER', slug: 'cement-silver', series: 'سمنت', collection: 'معماری', category: 'بتن', finish: 'مات',
    applications: ['کف', 'فضای اداری', 'فضای بیرونی'], image: '/images/products/tile-concrete.svg', tone: '#aaa9a5', sizes: [size100, size60],
    technical: { waterAbsorption: 'کمتر از ۰٫۵٪', breakingStrength: 'بیش از ۱۴۰۰ نیوتن', abrasionResistance: 'کلاس PEI V', frostResistance: 'کاملاً مقاوم', shadeVariation: 'V2 — تغییرات جزئی' },
  },
]

export const categories = ['همه', 'سنگ', 'بتن', 'مرمر', 'تراورتن'] as const
