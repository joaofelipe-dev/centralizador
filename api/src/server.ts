import 'dotenv/config'
import { app } from './app.js'
import { startCdStockScheduler } from './modules/cd-stock/cd-stock-scheduler.js'

const PORT = Number(process.env.PORT) || 3333
// 'localhost' não é alcançável de fora de um container; deixamos configurável.
const HOST = process.env.HOST || 'localhost'

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  // O agendador vive no processo do servidor, não no import de app.ts — assim
  // não dispara em testes nem em qualquer outro consumidor da instância Fastify.
  startCdStockScheduler()

  console.log(`Server is running at ${address}`)
})
