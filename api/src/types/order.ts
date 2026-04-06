export type OrderStatus = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'CANCELLED'

export const ORDER_STATUS_VALUES: OrderStatus[] = ['PENDING', 'APPROVED', 'CONFIRMED', 'CANCELLED']

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ORDER_STATUS_VALUES.includes(status as OrderStatus)
}
