import { JSONSchema7 } from 'json-schema'

export const errorResponse: Record<string, JSONSchema7> = {
  400: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      errors: { type: 'object', additionalProperties: true }
    }
  },
  401: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  },
  403: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  },
  404: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  },
  409: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  },
  500: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
}

export const uuidParam: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id']
}

export const minimalUserSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    username: { type: 'string' }
  }
}

export const minimalProductSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' }
  }
}

export const orderStatusEnum = ['PENDING', 'APPROVED', 'CONFIRMED', 'CANCELLED'] as string[]

export const userSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    username: { type: 'string' },
    name: { type: 'string' },
    email: { type: ['string', 'null'] as any },
    role: { type: 'string' },
    createdAt: { type: 'string' },
    stores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          code: { type: ['string', 'null'] as any },
          createdAt: { type: 'string' }
        }
      }
    }
  }
}

export const userListSchema: JSONSchema7 = {
  type: 'array',
  items: userSchema
}

export const createUserBody: JSONSchema7 = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    name: { type: 'string', minLength: 2 },
    email: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    storeIds: { type: 'array', items: { type: 'string' }, minItems: 1 },
    role: { type: 'string', enum: ['DEFAULT', 'SUPERVISOR', 'ADMIN'] }
  },
  required: ['username', 'name', 'password', 'storeIds']
}

export const updateUserBody: JSONSchema7 = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    name: { type: 'string', minLength: 2 },
    email: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    storeIds: { type: 'array', items: { type: 'string' } },
    role: { type: 'string', enum: ['DEFAULT', 'SUPERVISOR', 'ADMIN'] }
  }
}

export const loginBody: JSONSchema7 = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3 },
    password: { type: 'string', minLength: 6 }
  },
  required: ['username', 'password']
}

export const authResponse: JSONSchema7 = {
  type: 'object',
  properties: {
    user: userSchema,
    token: { type: 'string' }
  }
}

export const categorySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          stockCD: { type: ['integer', 'null'] as any },
          categoryId: { type: 'string' },
          userId: { type: 'string' },
          createdAt: { type: 'string' }
        }
      }
    }
  }
}

export const categoryListSchema: JSONSchema7 = {
  type: 'array',
  items: categorySchema
}

export const createCategoryBody: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 }
  },
  required: ['name']
}

export const storeSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    code: { type: ['string', 'null'] as any },
    createdAt: { type: 'string' }
  }
}

export const storeListSchema: JSONSchema7 = {
  type: 'array',
  items: storeSchema
}

export const createStoreBody: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    address: { type: 'string', minLength: 5 }
  },
  required: ['name', 'address']
}

export const updateStoreBody: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    address: { type: 'string', minLength: 5 },
    code: { type: 'string', minLength: 2 }
  }
}

export const productSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number' },
    stock: { type: 'integer' },
    stockCD: { type: ['integer', 'null'] as any },
    categoryId: { type: 'string' },
    userId: { type: 'string' },
    createdAt: { type: 'string' },
    category: categorySchema
  }
}

export const productListSchema: JSONSchema7 = {
  type: 'array',
  items: productSchema
}

export const createProductBody: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    categoryId: { type: 'string', format: 'uuid' },
    price: { type: 'number', exclusiveMinimum: 0 },
    stock: { type: 'integer', minimum: 0 }
  },
  required: ['name', 'categoryId', 'price']
}

export const updateProductBody: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    categoryId: { type: 'string', format: 'uuid' },
    price: { type: 'number', exclusiveMinimum: 0 },
    stock: { type: 'integer', minimum: 0 }
  }
}

export const orderItemSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    orderId: { type: 'string' },
    productId: { type: 'string' },
    quantity: { type: 'integer' },
    currentStock: { type: 'integer' }
  }
}

export const orderSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    storeId: { type: 'string' },
    userId: { type: 'string' },
    status: { type: 'string', enum: orderStatusEnum },
    orderDate: { type: 'string' },
    createdAt: { type: 'string' },
    items: { type: 'array', items: orderItemSchema },
    store: storeSchema,
    user: minimalUserSchema
  }
}

export const orderListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    data: { type: 'array', items: orderSchema },
    total: { type: 'integer' },
    limit: { type: 'integer' },
    offset: { type: 'integer' }
  }
}

export const orderDashboardSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    data: { type: 'array', items: orderSchema },
    total: { type: 'integer' },
    limit: { type: 'integer' },
    offset: { type: 'integer' }
  }
}

export const orderConsolidatedSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    products: { type: 'array', items: { type: 'object' } },
    stores: { type: 'array', items: { type: 'object' } },
    matrix: { type: 'object', additionalProperties: true }
  }
}

export const createOrderBody: JSONSchema7 = {
  type: 'object',
  properties: {
    storeId: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', minimum: 0 },
          currentStock: { type: 'integer', minimum: 0 }
        },
        required: ['productId', 'quantity']
      },
      minItems: 1
    },
    orderDate: { type: 'string' }
  },
  required: ['storeId', 'items']
}

export const updateOrderBody: JSONSchema7 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', minimum: 0 },
          currentStock: { type: 'integer', minimum: 0 }
        },
        required: ['productId', 'quantity']
      },
      minItems: 1
    },
    status: { type: 'string', enum: orderStatusEnum }
  }
}

export const updateOrderStatusBody: JSONSchema7 = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: orderStatusEnum }
  },
  required: ['status']
}

export const listOrdersQuery: JSONSchema7 = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    status: { type: 'string', enum: orderStatusEnum },
    storeId: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    date: { type: 'string' }
  }
}

export const supplierSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
    address: { type: ['string', 'null'] as any },
    contact: { type: ['string', 'null'] as any },
    createdAt: { type: 'string' }
  }
}

export const purchaseOrderSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    supplierId: { type: 'string' },
    userId: { type: 'string' },
    type: { type: 'string' },
    status: { type: 'string' },
    notes: { type: ['string', 'null'] as any },
    createdAt: { type: 'string' },
    supplier: supplierSchema,
    user: minimalUserSchema,
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' },
          unitCost: { type: ['number', 'null'] as any }
        }
      }
    }
  }
}

export const purchaseListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    data: { type: 'array', items: purchaseOrderSchema },
    total: { type: 'integer' },
    limit: { type: 'integer' },
    offset: { type: 'integer' }
  }
}

export const createPurchaseBody: JSONSchema7 = {
  type: 'object',
  properties: {
    supplierId: { type: 'string', format: 'uuid' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', exclusiveMinimum: 0 },
          unitCost: { type: 'number', minimum: 0 }
        },
        required: ['productId', 'quantity']
      },
      minItems: 1
    }
  },
  required: ['supplierId', 'items']
}

export const purchaseQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    supplierId: { type: 'string', format: 'uuid' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    limit: { type: 'integer', exclusiveMinimum: 0 },
    offset: { type: 'integer', minimum: 0 }
  }
}

export const movementSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    productId: { type: 'string' },
    type: { type: 'string' },
    quantity: { type: 'integer' },
    reason: { type: ['string', 'null'] as any },
    userId: { type: 'string' },
    createdAt: { type: 'string' },
    product: minimalProductSchema
  }
}

export const movementListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    data: { type: 'array', items: movementSchema },
    total: { type: 'integer' },
    limit: { type: 'integer' },
    offset: { type: 'integer' }
  }
}

export const movementQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    productId: { type: 'string', format: 'uuid' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    limit: { type: 'integer', exclusiveMinimum: 0 },
    offset: { type: 'integer', minimum: 0 }
  }
}

export const createAdjustmentBody: JSONSchema7 = {
  type: 'object',
  properties: {
    productId: { type: 'string', format: 'uuid' },
    quantity: { type: 'number' },
    reason: { type: 'string', minLength: 1 }
  },
  required: ['productId', 'quantity', 'reason']
}

export const stockCountSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    status: { type: 'string' },
    notes: { type: ['string', 'null'] as any },
    createdAt: { type: 'string' },
    user: minimalUserSchema,
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          physicalQty: { type: 'integer' },
          systemQty: { type: 'integer' },
          divergence: { type: 'integer' },
          product: productSchema
        }
      }
    }
  }
}

export const stockCountListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    data: { type: 'array', items: stockCountSchema },
    total: { type: 'integer' },
    limit: { type: 'integer' },
    offset: { type: 'integer' }
  }
}

export const stockCountQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    limit: { type: 'integer', exclusiveMinimum: 0 },
    offset: { type: 'integer', minimum: 0 }
  }
}

export const updateItemsBody: JSONSchema7 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          physicalQty: { type: 'integer', minimum: 0 }
        },
        required: ['productId', 'physicalQty']
      }
    }
  },
  required: ['items']
}

export const saleSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    supplierId: { type: 'string' },
    userId: { type: 'string' },
    type: { type: 'string' },
    status: { type: 'string' },
    createdAt: { type: 'string' },
    supplier: supplierSchema,
    user: minimalUserSchema,
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' }
        }
      }
    }
  }
}

export const saleListSchema: JSONSchema7 = {
  type: 'array',
  items: saleSchema
}

export const createSaleBody: JSONSchema7 = {
  type: 'object',
  properties: {
    supplierId: { type: 'string', format: 'uuid' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', exclusiveMinimum: 0 }
        },
        required: ['productId', 'quantity']
      },
      minItems: 1
    }
  },
  required: ['supplierId', 'items']
}
