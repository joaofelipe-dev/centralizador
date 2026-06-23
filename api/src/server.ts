import 'dotenv/config'
import { app } from './app.js'

const PORT = Number(process.env.PORT) || 3333

app.listen({ port: PORT, host: '192.168.0.52' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running at ${address}`)
})
