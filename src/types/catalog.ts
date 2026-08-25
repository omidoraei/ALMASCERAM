export type TileSize = {
  id: string
  label: string
  widthMm: number
  heightMm: number
  thicknessMm: number
  faces: number
  weightKg: number
}

export type Product = {
  id: string
  name: string
  englishName: string
  slug: string
  series: string
  collection: string
  category: 'سنگ' | 'بتن' | 'مرمر' | 'تراورتن'
  finish: 'مات' | 'پولیش' | 'ساختار‌دار'
  applications: string[]
  image: string
  tone: string
  badge?: string
  sizes: TileSize[]
  technical: {
    waterAbsorption: string
    breakingStrength: string
    abrasionResistance: string
    frostResistance: string
    shadeVariation: string
  }
}

export type InquiryItem = {
  key: string
  productId: string
  productName: string
  series: string
  image: string
  size: TileSize
  quantity: number
}
