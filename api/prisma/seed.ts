import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

const storesData = [
  { id: "18", name: "Av. Portugal", address: "Av. Portugal, 1397" },
  { id: "20", name: "Henrique Dumont", address: "Rua Henrique Dumont, 1365" },
  { id: "16", name: "Tamandaré", address: "Rua Tamandaré, 977" },
  { id: "15", name: "Sertãozinho", address: "Rua Humberto Hortolan, 970" },
  { id: "17", name: "Nova Aliança", address: "Rua Professor Roberto José, 200" },
  { id: "14", name: "Jardim Botânico", address: "Av. Carlos Eduardo de Gasperi Consoni, 1392" },
  { id: "8", name: "San Marco", address: "Estr. da Limeirinha, 1350" },
  { id: "21", name: "Jardim Califórnia", address: "Av. Califórnia, 747" },
  { id: "19", name: "Centro de Distribuição", address: "Av. Celso Daniel, 505" }
]

const productCategories = [
  {
    category: "Legumes",
    products: [
      "Acelga", "Abóbora Baby", "Abóbora p/ Doce", "Moranga", "Moranga Baby", "Mugango", "Cabotiá",
      "Abobrinha Caipira", "Abobrinha Italiana", "Abobrinha Menina", "Abobrinha Paulista", "Abobrinha Clarita",
      "Alcachofra", "Alcachofra Baby", "Alho descascado", "Alho roxo",
      "Batata Doce", "Batata Monalisa", "Batata Asterix", "Batata Binge", "Batata Yacon",
      "Berinjela", "Beterraba", "Beterraba Média", "Beterraba Cozida",
      "Cará", "Caxi", "Cebola Branca", "Cebola Roxa", "Cenoura", "Cenoura Média", "Chuchu",
      "Couve-flor", "Couve-flor Roxa", "Couve-flor Band",
      "Ervilha Grão", "Ervilha Torta", "Gengibre", "Gengibre Miúdo",
      "Inhame", "Inhame Miúdo", "Jiló Verde", "Jiló Branco",
      "Mandioca", "Mandioquinha", "Maxixe", "Pepino", "Pimentas", "Pimentões", "Quiabo", "Quiabo Band",
      "Repolho Verde", "Repolho Roxo", "Tomates", "Vagem", "Milho Doce", "Feijão de Corda"
    ]
  },
  {
    category: "Frutas",
    products: [
      "Abacate", "Avocado", "Abacaxi", "Acerola", "Achachairu", "Abiu", "Ameixas", "Amora", "Atemoia",
      "Bananas", "Cacau", "Caju", "Cajamanga", "Caqui", "Carambola", "Cereja", "Coco Verde", "Coco Seco",
      "Cupuaçu", "Damasco", "Figo", "Framboesa", "Fruta do Conde", "Goiaba Branca", "Goiaba Vermelha",
      "Granadila", "Groselha", "Graviola", "Jabuticaba", "Jaca", "Jambo", "Kiwi", "Laranja", "Lichia",
      "Limões", "Maçã", "Mamão", "Manga", "Mangostim", "Maracujá Doce", "Maracujá Azedo", "Melancia", "Melões",
      "Milho Verde", "Mirtilho", "Morango", "Nectarina", "Nêspera", "Noni", "Peras", "Pêssegos", "Physalis",
      "Pinha", "Pinhão", "Pitaya", "Pitanga", "Rambutan", "Romã", "Sapoti", "Seriguela", "Tamarindo", "Tamarillo",
      "Tangerinas", "Umbu", "Uvas", "Pequi", "Uva Mista", "Uva Nubia", "Uva Isis", "Uva Ouro", "Uva Estela",
      "Mix Frutas Vermelhas", "Água de Coco (500ml)", "Água de Coco (1L)"
    ]
  },
  {
    category: "Verduras",
    products: [
      "Agrião", "Agrião Hidro", "Agrião Lavado", "Alfaces", "Alho-poró", "Almeirão", "Almeirão Lavado",
      "Brócolis Comum", "Brócolis Ninja", "Brócolis Lavado", "Cebolinha", "Cebolinha Lavada", "Cheiro Verde",
      "Chicória", "Chicória Lavada", "Couve", "Couve Lavada", "Coentro", "Coentro Industrial", "Coentro Lavado",
      "Erva Doce", "Espinafre", "Espinafre Lavado", "Hortelã", "Hortelã Lavado", "Nabo", "Rabanete",
      "Rúcula", "Rúcula Selvática", "Rúcula Baby", "Rúcula Lavada", "Salsa", "Salsa Lavada", "Salsão"
    ]
  },
  {
    category: "Ervas e Especiais",
    products: [
      "Açafrão", "Alecrim", "Manjericão", "Tomilho", "Orégano", "Hortelã", "Melissa", "Menta", "Capim Cidreira",
      "Folha de Uva", "Folha de Beterraba", "Folha de Cenoura", "Couve Kale", "Couve Bruxelas",
      "Broto de Bambu", "Nirá", "Mizuna", "Pak Choi", "Tofu", "Raiz Forte", "Flores Comestíveis",
      "Mini Alface", "Mini Crespa"
    ]
  },
  {
    category: "Diversos",
    products: [
      "Shimeji", "Shitake", "Paris", "Porto Belo", "Cogumelo Mix", "Hiratake", "Shimeji Salmão",
      "Aspargos Verde", "Aspargos Branco", "Endívia", "Endívia Roxa", "Moyashi", "Palmito Pupunha",
      "Hortaliças Lavadas", "Bandejados"
    ]
  }
]

async function main() {
  console.log('Seed started...')

  const adminUsername = 'admin'
  const supervisorUsername = 'supervisor'

  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.user.deleteMany({ where: { OR: [{ username: adminUsername }, { username: supervisorUsername }] } })
  await prisma.store.deleteMany({})

  const createdStores = []
  for (const s of storesData) {
    const store = await prisma.store.create({ data: s })
    createdStores.push(store)
  }
  console.log(`Created ${createdStores.length} stores`)

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
      stores: { connect: createdStores.map(s => ({ id: s.id })) }
    }
  })
  console.log('Admin user created with role ADMIN')

  const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 10)
  const supervisor = await prisma.user.create({
    data: {
      username: supervisorUsername,
      name: 'Supervisor',
      email: 'supervisor@supervisor.com',
      password: hashedSupervisorPassword,
      role: 'SUPERVISOR',
      stores: { connect: createdStores.map(s => ({ id: s.id })) }
    }
  })
  console.log('Supervisor user created with role SUPERVISOR')
  
  for (const item of productCategories) {
    const category = await prisma.category.create({ data: { name: item.category } })
    console.log(`Category created: ${category.name}`)

    for (const productName of item.products) {
      await prisma.product.create({
        data: {
          name: productName,
          price: 0,
          stock: 999,
          categoryId: category.id,
          userId: admin.id
        }
      })
    }
    console.log(`Inserted ${item.products.length} products for ${item.category}`)
  }

  console.log('Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
