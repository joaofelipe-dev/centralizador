import 'dotenv/config'
import { app } from './app.js'

const PORT = Number(process.env.PORT) || 3333

app.listen({ port: PORT, host: 'localhost' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running at ${address}`)
})
