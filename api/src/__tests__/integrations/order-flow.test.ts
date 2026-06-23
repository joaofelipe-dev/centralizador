import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.API_URL || 'http://192.168.0.52:3333'

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const body = res.status === 204 ? undefined : await res.json()
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${body?.message || res.statusText}`)
  }
  return body
}

describe('Fluxo completo: Login → Criar Pedido → Verificar no Gestão', () => {
  let token: string
  let storeId: string
  let productId: string
  let orderId: string

  it('1. Login como admin', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    })
    expect(res).toHaveProperty('token')
    expect(res).toHaveProperty('user')
    token = res.token
  })

  it('2. Buscar lojas e produtos do seed', async () => {
    const authHeader = { Authorization: `Bearer ${token}` }
    const stores: any[] = await api('/stores', { headers: authHeader })
    expect(stores.length).toBeGreaterThan(0)
    storeId = stores[0].id

    const products: any[] = await api('/products', { headers: authHeader })
    expect(products.length).toBeGreaterThan(0)
    productId = products[0].id
  })

  it('3. Criar pedido', async () => {
    const order: any = await api('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        storeId,
        items: [{ productId, quantity: 1 }],
        orderDate: new Date().toISOString().split('T')[0],
      }),
    })
    expect(order).toHaveProperty('id')
    expect(order.storeId).toBe(storeId)
    orderId = order.id
  })

  it('4. Verificar pedido na listagem', async () => {
    const list: any = await api('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(list).toHaveProperty('data')
    expect(Array.isArray(list.data)).toBe(true)
    expect(list.data.some((o: any) => o.id === orderId)).toBe(true)
  })
})
