export type FirstMileRouteKey = 'economy' | 'standard' | 'express' | 'air' | 'priorityAir'
export type FirstMileCargoTypeKey = 'classA' | 'classB'

export interface FirstMileRoute {
  key: FirstMileRouteKey
  label: string
  shortLabel: string
  days: [number, number]
  availableLines: number
  pricePerKg: [number, number]
  accent: string
  emoji: string
}

export interface FirstMileCargoType {
  key: FirstMileCargoTypeKey
  label: string
  tags: string[]
  priceFactor: number
}

export interface FirstMileQuoteInput {
  routeKey: FirstMileRouteKey
  cargoTypeKey: FirstMileCargoTypeKey
  shipmentDate: string
  quantity: number
  weightKg: number
  densityKgPerM3: number
}

export interface FirstMileQuoteEstimate {
  route: FirstMileRoute
  cargoType: FirstMileCargoType
  volumeM3: number
  priceRange: [number, number]
  perItemRange: [number, number]
  arrivalRange: [string, string]
}

export const firstMileRoutes: FirstMileRoute[] = [
  {
    key: 'economy',
    label: '经济线路',
    shortLabel: '经济',
    days: [30, 40],
    availableLines: 12,
    pricePerKg: [6.5, 7.94],
    accent: 'green',
    emoji: '🚛',
  },
  {
    key: 'standard',
    label: '普快线路',
    shortLabel: '普快',
    days: [20, 30],
    availableLines: 10,
    pricePerKg: [7.8, 9.4],
    accent: 'blue',
    emoji: '🚚',
  },
  {
    key: 'express',
    label: '特快线路',
    shortLabel: '特快',
    days: [18, 25],
    availableLines: 8,
    pricePerKg: [8.8, 10.6],
    accent: 'purple',
    emoji: '⚡',
  },
  {
    key: 'air',
    label: '空运线路',
    shortLabel: '空运',
    days: [7, 15],
    availableLines: 6,
    pricePerKg: [15.8, 19.2],
    accent: 'orange',
    emoji: '✈️',
  },
  {
    key: 'priorityAir',
    label: '特快空运',
    shortLabel: '特快空运',
    days: [3, 7],
    availableLines: 4,
    pricePerKg: [22.6, 28.8],
    accent: 'red',
    emoji: '🚀',
  },
]

export const firstMileCargoTypes: FirstMileCargoType[] = [
  {
    key: 'classA',
    label: '一类货物',
    tags: ['服装鞋帽', '箱包配饰', '家居用品', '玩具母婴', '运动户外', '美妆个护'],
    priceFactor: 1,
  },
  {
    key: 'classB',
    label: '二类货物',
    tags: ['带电产品', '液体粉末', '磁性商品', '超大件货物', '易碎品', '高货值商品'],
    priceFactor: 1.18,
  },
]

export const firstMileQuantityOptions = [100, 200, 500, 1000, 1500]
export const firstMileWeightOptions = [50, 100, 200, 500, 800, 1000, 2000]
export const firstMileDensityOptions = [110, 120, 130, 140, 150, 160, 170, 180, 190, 200]
export const firstMileValueAddedServices = ['打托盘', '缠防水胶带', '送官方仓', '送海外仓', '不寄市场']

export const findFirstMileRoute = (key: FirstMileRouteKey) =>
  firstMileRoutes.find((route) => route.key === key) ?? firstMileRoutes[0]

export const findFirstMileCargoType = (key: FirstMileCargoTypeKey) =>
  firstMileCargoTypes.find((cargoType) => cargoType.key === key) ?? firstMileCargoTypes[0]

export const estimateVolume = (weightKg: number, densityKgPerM3: number) => {
  if (weightKg <= 0 || densityKgPerM3 <= 0) return 0
  return Number((weightKg / densityKgPerM3).toFixed(2))
}

export const formatMonthDay = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const calculateArrivalRange = (shipmentDate: string, days: [number, number]): [string, string] => {
  const startDate = new Date(`${shipmentDate}T00:00:00`)
  const endDate = new Date(`${shipmentDate}T00:00:00`)
  startDate.setDate(startDate.getDate() + days[0])
  endDate.setDate(endDate.getDate() + days[1])
  return [formatMonthDay(startDate), formatMonthDay(endDate)]
}

export const calculateFirstMileQuote = (input: FirstMileQuoteInput): FirstMileQuoteEstimate => {
  const route = findFirstMileRoute(input.routeKey)
  const cargoType = findFirstMileCargoType(input.cargoTypeKey)
  const priceRange: [number, number] = [
    Math.round(input.weightKg * route.pricePerKg[0] * cargoType.priceFactor),
    Math.round(input.weightKg * route.pricePerKg[1] * cargoType.priceFactor),
  ]
  const perItemRange: [number, number] = input.quantity > 0
    ? [
        Number((priceRange[0] / input.quantity).toFixed(2)),
        Number((priceRange[1] / input.quantity).toFixed(2)),
      ]
    : [0, 0]

  return {
    route,
    cargoType,
    volumeM3: estimateVolume(input.weightKg, input.densityKgPerM3),
    priceRange,
    perItemRange,
    arrivalRange: calculateArrivalRange(input.shipmentDate, route.days),
  }
}
