type ProductImageSeed = {
  label: string
  subtitle: string
  palette: [string, string]
  accent: string
}

const createSalesProductImageDataUrl = ({ label, subtitle, palette, accent }: ProductImageSeed) => {
  const [from, to] = palette
  const svg = `
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="18" fill="url(#paint0_linear)"/>
      <circle cx="74" cy="22" r="16" fill="rgba(255,255,255,0.14)"/>
      <circle cx="22" cy="78" r="20" fill="rgba(255,255,255,0.10)"/>
      <rect x="20" y="18" width="56" height="42" rx="12" fill="rgba(255,255,255,0.94)"/>
      <rect x="30" y="28" width="36" height="6" rx="3" fill="${accent}" fill-opacity="0.24"/>
      <rect x="30" y="40" width="22" height="6" rx="3" fill="${accent}" fill-opacity="0.12"/>
      <rect x="28" y="66" width="40" height="16" rx="8" fill="rgba(255,255,255,0.18)"/>
      <text x="48" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="rgba(255,255,255,0.96)">${label}</text>
      <text x="48" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="600" fill="rgba(255,255,255,0.74)">${subtitle}</text>
      <defs>
        <linearGradient id="paint0_linear" x1="10" y1="8" x2="84" y2="92" gradientUnits="userSpaceOnUse">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const salesProductImageSeeds: Record<string, ProductImageSeed> = {
  'CHARGE-01': { label: 'CH', subtitle: 'CHARGE', palette: ['#4f7cff', '#3b82f6'], accent: '#2563eb' },
  'KETTLE-02': { label: 'KT', subtitle: 'KETTLE', palette: ['#fb7185', '#f43f5e'], accent: '#e11d48' },
  'LAMP-03': { label: 'LP', subtitle: 'LAMP', palette: ['#f59e0b', '#f97316'], accent: '#ea580c' },
  'RACK-04': { label: 'RK', subtitle: 'RACK', palette: ['#22c55e', '#16a34a'], accent: '#15803d' },
  'COOK-05': { label: 'CK', subtitle: 'COOK', palette: ['#8b5cf6', '#7c3aed'], accent: '#6d28d9' },
  'BAG-01': { label: 'BG', subtitle: 'BAG', palette: ['#06b6d4', '#0891b2'], accent: '#0f766e' },
  'CAR-02': { label: 'CR', subtitle: 'CAR', palette: ['#0ea5e9', '#2563eb'], accent: '#1d4ed8' },
  'BOX-03': { label: 'BX', subtitle: 'BOX', palette: ['#10b981', '#059669'], accent: '#047857' },
  'WIRE-04': { label: 'WR', subtitle: 'WIRE', palette: ['#6366f1', '#4f46e5'], accent: '#4338ca' },
  'COFFEE-05': { label: 'CF', subtitle: 'COFFEE', palette: ['#f97316', '#ea580c'], accent: '#c2410c' },
}

const fallbackSeed: ProductImageSeed = {
  label: 'PR',
  subtitle: 'PRODUCT',
  palette: ['#94a3b8', '#64748b'],
  accent: '#475569',
}

const productImageCache = new Map<string, string>()

export const getSalesProductImage = (sku: string) => {
  const cachedImage = productImageCache.get(sku)
  if (cachedImage) return cachedImage

  const image = createSalesProductImageDataUrl(salesProductImageSeeds[sku] ?? fallbackSeed)
  productImageCache.set(sku, image)
  return image
}
