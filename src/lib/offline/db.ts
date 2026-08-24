const DB_NAME = 'centralizador-offline'
const DB_VERSION = 2

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = request.result

      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' })
      }

      // A v1 criava 'queue' com keyPath 'clientId', mas putRecord grava o envelope
      // { key, value } — sem 'clientId' no topo, todo put falhava com DataError e
      // nenhum pedido chegava a ser enfileirado. Não há dado válido a preservar.
      if (event.oldVersion < 2 && db.objectStoreNames.contains('queue')) {
        db.deleteObjectStore('queue')
      }

      if (!db.objectStoreNames.contains('queue')) {
        const store = db.createObjectStore('queue', { keyPath: 'key' })
        store.createIndex('status', 'value.status', { unique: false })
        store.createIndex('createdAt', 'value.createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })

  return dbPromise
}

async function getStore(
  name: string,
  mode: IDBTransactionMode = 'readonly',
): Promise<IDBObjectStore> {
  const db = await openDB()
  const transaction = db.transaction(name, mode)
  return transaction.objectStore(name)
}

export async function getItem<T>(storeName: string, key: string): Promise<T | undefined> {
  const store = await getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result?.value as T | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function setItem(storeName: string, key: string, value: unknown): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ key, value })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteItem(storeName: string, key: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function countStore(storeName: string): Promise<number> {
  const store = await getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.count()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: string,
): Promise<T[]> {
  const db = await openDB()
  const transaction = db.transaction(storeName, 'readonly')
  const store = transaction.objectStore(storeName)
  const index = store.index(indexName)
  return new Promise((resolve, reject) => {
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result?.map((r: { value: T }) => r.value) ?? [])
    request.onerror = () => reject(request.error)
  })
}

export async function putRecord(storeName: string, record: { key: string; value: unknown }): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
