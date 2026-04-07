import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const categories = [
  {
    name: 'Legumes',
    products: [
      'Acelga', 'Abobora Baby', 'Abobora p/ Doce', 'Abobrinha Caipira', 'Abobrinha Caipira G',
      'Abobrinha Clarita', 'Abobrinha Italiana', 'Abobrinha Menina', 'Abobrinha Paulista',
      'Alcachofra', 'Alcachofra Baby', 'Alho Descascado', 'Alho Roxo', 'Avocado', 'Avocado 5kg',
      'Batata Doce Roxa', 'Batata Doce Branca', 'Batata Doce Vermelha', 'Batata Doce Salmon',
      'Batata Monalisa', 'Batata Pirulito', 'Batata Asterix', 'Batata Binge', 'Batata Yacon',
      'Batata Cesar (Suja)', 'Berinjela', 'Berinjela Media', 'Berinjela Conserva',
      'Berinjela Japonesa', 'Berinjela Rajada', 'Beterraba', 'Beterraba Media', 'Cabotia',
      'Cara', 'Caxi', 'Cebola Argentina', 'Cebola Nacional', 'Cebola Pirulito', 'Cebola Borbim',
      'Cebola Branca Import.', 'Cebola Roxa Import.', 'Cenoura', 'Cenoura Media', 'Chuchu',
      'Couve Flor', 'Couve Flor Band', 'Couve Flor Roxa', 'Ervilha Grão', 'Ervilha Torta',
      'Gengibre', 'Gengibre Miudo', 'Inhame', 'Inhame Miudo', 'Jilo Verde', 'Jilo Branco',
      'Mandioca s/ Casca', 'Mandioca com casca', 'Mandioquinha Salsa', 'Mandioquinha Salsa Media',
      'Maxixe', 'Moranga', 'Moranga Baby', 'Mugango', 'Pepino Caipira', 'Pepino Caipira Branco',
      'Pepino Conserva', 'Pepino Conserva Medio', 'Pimenta Ardida', 'Pimenta Ardida 1/2',
      'Pimenta Americana', 'Pimenta Biquinho', 'Pimenta Cambuci', 'Pimenta Malagueta',
      'Pimentão Verde', 'Pimentão Verde Medio', 'Pimentão Vermelho', 'Pimentão Vermelho Medio',
      'Pimentão Amarelo', 'Pimentão Amarelo Medio', 'Pimentão Creme/Laranja', 'Pimentão Rei',
      'Pimentão Mesclado/Colorido', 'Quiabo', 'Quiabo Band', 'Repolho Roxo', 'Repolho Verde',
      'Repolho Verde Medio', 'Tomate Amarelo c/4', 'Tomate Caqui PP', 'Tomate Caqui cx Grande',
      'Tomate Cereja', 'Tomate Cereja c/4', 'Tomate Cereja Band', 'Tomate Coquetel 10kg',
      'Tomate Grape 10kg', 'Tomate Grape 20kg', 'Tomate Grape Band', 'Tomate Holandes',
      'Tomate Italiano', 'Tomate Longa Vida', 'Tomate Longa Vida Medio', 'Tomate Pizzadoro',
      'Tomate Pizzadoro Medio', 'Tomate Rasteiro', 'Tomate Rasteiro Medio', 'Tomate Romanita',
      'Tomate Salada', 'Tomate Salada Medio', 'Tomate Mamotoro', 'Tomate Pera/Perinha',
      'Vagem', 'Vagem Manteiga', 'Vagem Verdinha', 'Uva mista', 'tangerina olé',
      'milho doce', 'morango isopor hidroponico', 'Tangerina Rio 9Kg',
      'Pessego 3Kg - 1 camada', 'Pitaya 3Kg', 'Laranja 7Kg saco', 'Melancia Polpa Amarela',
      'Laranja Cara Cara', 'Laranja Champanhe', 'Melão Dino', 'Uva Isis', 'Abacaxi cx',
      'Lenha', 'Melão Net', 'Maça Gransmith 1/2', 'Manga Maça', 'Mandioca Pct 1kg',
      'Pimentas Diversas', 'Mix Frutas Vermelhas', 'Castanha Portuguesa', 'Tamarillo',
      'Uva Black / Morango', 'Folha de Uva', 'Tomate Coquetel 5kg', 'Manga Keit',
      'Tomate Coquetel 15Kg', 'Melão Salmão', 'Terra Adubada', 'Pimenta de Cheiro',
      'Pimenta Palermo', 'Morango Isopor c/2', 'Achachairu', 'Mandioca cx', 'Uva Nubia',
      'Uva Doce Natural', 'Uva Ouro', 'Uva Estela', 'Batata Primeirinha', 'Agua Coco 500ml',
      'Agua Coco 1 Litro', 'Pequi', 'Beterraba Cozida', 'Feijão de Corda'
    ]
  },
  {
    name: 'Frutas',
    products: [
      'Abacate', 'Abacaxi Perola', 'Abacaxi Perola Medio', 'Abacaxi Hawai', 'Abacaxi Gomo',
      'Abil', 'Acerola', 'Ameixa Dagen', 'Ameixa Dinossauro', 'Ameixa USA', 'Ameixa Importada',
      'Ameixa Nacional 6kg', 'Ameixa Nacional 6kg Band', 'Ameixa Nacional 10kg - 2A',
      'Ameixa Nacional 10kg - 3A', 'Ameixa Nacional 10kg - 4A', 'Ameixa Sun Golden',
      'Amora', 'Amora Band', 'Atemoia 4kg', 'Atemoia 8kg', 'Banana Maça 15kg',
      'Banana Maça 20kg', 'Banana Nanica 15kg', 'Banana Nanica 20kg', 'Banana Nanica Exportação',
      'Banana Prata 15kg', 'Banana Prata 20kg', 'Banana Fritar', 'Banana Terra',
      'Banana Ouro', 'Banana Organica (Prata)', 'Banana Turma Monica (Nanica)', 'Cacau',
      'Cajamanga', 'Caju', 'Caqui CP', 'Caqui Chocolate/Kioto', 'Caqui Fuiu', 'Caqui Guiombo',
      'Caqui Rama Forte 12kg (c/20band)', 'Caqui Rama Forte 6kg', 'Caqui Rama Forte 10kg',
      'Carambola', 'Carambola Band', 'Cereja Band.', 'Cereja Importada', 'Coco Verde',
      'Coco Seco', 'Cupuaçu', 'Damasco', 'Figo', 'Figo da India', 'Framboesa',
      'Fruta do Conde', 'Goiaba Branca 2kg', 'Goiaba Branca 10kg', 'Goiaba Vermelha 2kg',
      'Goiaba Vermelha 10kg', 'Goiaba Vermelha 12kg - GG', 'Granadila', 'Grape Fruit',
      'Graviola', 'Groselha', 'Jabuticaba', 'Jaca', 'Jambo', 'Jurubeba', 'Kinkan',
      'Kiwi Nacional', 'Kiwi Importado', 'Kiwi Golden / Band.', 'Kiwi Nova Zelandia',
      'Laranja Lima', 'Laranja Bahia Nac.', 'Laranja Bahia Imp.', 'Laranja Pera Rio',
      'Laranja Pera Rio Suco', 'Laranja Selecta', 'Lichia', 'Lichia c/4', 'Lima da Persia',
      'Lima da Persia 1/2', 'Limão Taithi', 'Limão Cravo', 'Limão Galego', 'Limão Siciliano',
      'Limão Siciliano 1/2', 'Longan', 'Maça Argentina', 'Maça Argentina 1/2', 'Maça Fuji',
      'Maça Fuji 1/2', 'Maça Fuji Miuda', 'Maça Gala', 'Maça Gala 1/2', 'Maça Gala Miuda',
      'Maça Verde Gransmith', 'Maça Pink Lady', 'Maça Sacolinha', 'Mamão Formosa',
      'Mamão Formosa Exportação', 'Mamão Papaia', 'Mamão Papaia Belo', 'Manga Borbom',
      'Manga Comum', 'Manga Coquinho', 'Manga Espada', 'Manga Haden', 'Manga Ouro',
      'Manga Palmer', 'Manga Palmer 10kg', 'Manga Palmer 18kg', 'Manga Rosa', 'Manga Sabina',
      'Manga Tomy', 'Manga Tomy 10kg', 'Manga Tomy 18kg', 'Manga Vandaik', 'Mangostim',
      'Maracuja Azedo', 'Maracuja Azedo p/ Suco', 'Maracuja Doce', 'Melancia',
      'Melancia s/ Semente / Baby', 'Melão Amarelo', 'Melão Cantaloupe', 'Melão Clarante',
      'Melão Espanhol', 'Melão Espanhol Rei', 'Melão Galia', 'Melão Rei - Original',
      'Melão Orange', 'Melão Rei - Redinha (sp)', 'Milho Verde Band', 'Milho Verde Saco',
      'Mirtilho', 'Morango', 'Morango Export.', 'Morango Organico', 'Nectarina USA',
      'Nectarina Importada', 'Nectarina Nacional 6kg', 'Nectarina Nacional 10kg - 2A',
      'Nectarina Nacional 10kg - 3A', 'Nectarina Nacional 10kg - 4A', 'Nespera', 'Noni',
      'Pera Asiatica', 'Pera Bosc', 'Pera D\'anjou', 'Pera Ercolina', 'Pera Forelle',
      'Pera Park', 'Pera Park 1/2', 'Pera Portuguesa', 'Pera Portuguesa Band',
      'Pera Sacolinha', 'Pera Vermelha', 'Pera Willians', 'Pera Willians 1/2', 'Pessego CP',
      'Pessego Amarelo', 'Pessego Branco', 'Pessego Dunits', 'Pessego USA', 'Pessego Importado',
      'Pessego Nacional 6kg', 'Pessego Nacional 10kg - 2A', 'Pessego Nacional 10kg - 3A',
      'Pessego Nacional 10kg - 4A', 'Phisalis', 'Pinha', 'Pinhão', 'Pitanga', 'Pitaya',
      'Ranbutan', 'Romã', 'Romã Importado', 'Sapoti', 'Seriguela', 'Tamarindo',
      'Tangerina Bergamota', 'Tangerina Cravo', 'Tangerina Decopon', 'Tangerina Importada',
      'Tangerina Morgote', 'Tangerina Morgote 1/2', 'Tangerina Poncan', 'Tangerina Poncan 1/2',
      'Tangerina Rio', 'Tangerina Verona s/ Sem.', 'Umbu', 'Uva Sta Isabel',
      'Uva Algodão Doce', 'Uva Benetaka', 'Uva Brasil', 'Uva Crinsom', 'Uva Crinsom Band.',
      'Uva Italia', 'Uva Japonesa', 'Uva Moscatel', 'Uva Pilar Moscato', 'Uva Red Glob',
      'Uva Red Meire', 'Uva Rosada Band', 'Uva Rosada 5kg', 'Uva Rosada 10kg', 'Uva Rubi',
      'Uva Safira', 'Uva Thompison', 'Uva Thompison Band.', 'Uva Vitoria'
    ]
  },
  {
    name: 'Verduras',
    products: [
      'Agrião Cx', 'Agrião Hidroponico', 'Alface Americana cx', 'Alface Americana Band Hidro',
      'Alface Crespa cx', 'Alface Crespa Hidro mç', 'Alface Crocante', 'Alface Frizzly Roxa mç',
      'Alface Frizzly Verde mç', 'Alface Freelize cx', 'Alface Grega cx', 'Alface Lisa cx',
      'Alface Lisa Hidro mç', 'Alface Mimosa cx', 'Alface Mimosa Hidro mç', 'Alface Romana cx',
      'Alface Romana mç', 'Alface Roxa cx', 'Alface Roxa Hidro mç',
      'Alface Roxa Mimosa Hidro mç', 'Alface Tricolor', 'Alho Poro', 'Almeirão Catalonia',
      'Almeirão Comum', 'Almeirão Pão Açucar', 'Brocolis Comum', 'Brocolis Ninja',
      'Cebolinha', 'Cheiro Verde', 'Chicoria cx', 'Chicoria mç', 'Couve cx', 'Couve mç',
      'Coentro mç', 'Coentro Ind.', 'Erva Doce', 'Espinafre cx', 'Espinafre mç', 'Hortela mç',
      'Hortela Ind.', 'Hortela Kibe', 'Hortela Levante', 'Nabo', 'Rabanete', 'Rucula',
      'Rucula cx', 'Rucula Selvatica', 'Salsa', 'Salsão'
    ]
  },
  {
    name: 'Maçarias',
    products: [
      'Açafrão', 'Aipo', 'Alecrim', 'Alfafa', 'Alfavaca', 'Arnica', 'Arruda', 'Basilicão',
      'Beterraba Baby', 'Beterraba Conserva', 'Boldo', 'Broto Bambu / Takenoko', 'Buscopan',
      'Capim Cidreira', 'Capim Santo', 'Caramoela', 'Carqueija', 'Canfora', 'Cebolete',
      'Cenoura Gobo', 'Cenoura Rama', 'Cidreira', 'Cominho', 'Couve Bruxelas', 'Couve Rabano',
      'Dill', 'Erva Sta Maria', 'Ervas', 'Estragão', 'Flor Comestivel', 'Folha Beterraba',
      'Folha de Cenoura', 'Folha de Graviola', 'Gobo', 'Guaco', 'Hanna Nira', 'Horenzzo',
      'Louro', 'Manjericão', 'Manjericão Roxo', 'Manjerona', 'Mastruz', 'Melissa', 'Menta',
      'Mini Crespa', 'Mini Lisa', 'Mini Mimosa', 'Mini Romana', 'Mizuna', 'Mostarda',
      'Nabo Frances', 'Nabo Redondo', 'Nirá', 'Oregano', 'Pepino Baby', 'Poejo', 'Radiche',
      'Raiz Forte', 'Salsa Crespa', 'Salvia', 'Taioba', 'Tinguensai / Pakoshoy', 'Tofu',
      'Tomilho', 'Tomilho Limão', 'Vick', 'Citronela', 'Por Nobe', 'Lakio', 'Peixinho',
      'Couve Kale', 'Alecrim Kg', 'Hortelã Kg', 'Manjericão Kg', 'Tomilho Kg', 'Rucula Baby',
      'Batata Doce 350grs c/20 (Trebeschi)', 'Cereja Amarela 250gr c/46 (Trebeschi)',
      'Milho 450gr c/36 (Trebeschi)', 'Tomate Cereja Rama 200gr c/46 (Trebeschi)',
      'Tomatinhos Confeites 250gr c/46 (Trebeschi)', 'Tomate Turma da Monica Uva 180gr c/60  (Trebeschi)'
    ]
  },
  {
    name: 'Diversos',
    products: [
      'Aspargo', 'Aspargo Branco', 'Cenoura Baby', 'Cenoura Baby Monica', 'Endivia',
      'Endivia Roxa', 'Moyashi G', 'Moyashi M', 'Cogumelo Ering', 'Cogumelo Hiratak',
      'Cogumelo Mix', 'Cogumelo Salmão', 'Cog.Shimeji Amarelo', 'Cog.Shimeji Branco',
      'Cog.Shimeji Fatiado', 'Cog.Shimeji Preto', 'Cogumelo Paris Fatiado', 'Cog. Shitake',
      'Cogumelo Paris', 'Cogumelo Porto Belo', 'Cogumelo Porto Belo Fatiado',
      'Palmito Pupunha', 'Transf Lojas P/ Marrone-Eduardo', 'Banana Organica Nanica',
      'Banana Organica Prata', 'Alface Americana Lavada', 'Alface Roxa Lavada', 'Couve Lavada',
      'Chicoria Lavada', 'Cebolinha Lavada', 'Salsa Lavada', 'Agriao Lavado', 'Hortela Lavado',
      'Alface Crespa Hidro Lavada', 'Alface Lisa Hidro Lavada', 'Alface Mimosa Lavada',
      'Alface Romana Lavada', 'Rucula Lavada', 'Almeirao Comum Lavado', 'Coentro Lavado',
      'Espinafre Lavado', 'Brocolis Lavado', 'Bandejados Pré Processados'
    ]
  }
]

async function main() {
  console.log('🚀 Starting product reset...')

  // Get first user or create default
  let user = await prisma.user.findFirst()
  if (!user) {
    console.log('⚠️ No user found, creating default user...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash('admin123', 10)
    user = await prisma.user.create({
      data: {
        username: 'admin',
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
  }
  console.log(`✅ Using user: ${user.name} (${user.id})`)

  // Delete existing related records first
  console.log('🗑️ Deleting existing order items...')
  await prisma.orderItem.deleteMany()
  
  console.log('🗑️ Deleting existing orders...')
  await prisma.order.deleteMany()
  
  // Delete existing products first (due to foreign key)
  console.log('🗑️ Deleting existing products...')
  await prisma.product.deleteMany()

  // Delete existing categories
  console.log('🗑️ Deleting existing categories...')
  await prisma.category.deleteMany()

  // Create new categories and products
  for (const cat of categories) {
    console.log(`📁 Creating category: ${cat.name} (${cat.products.length} products)`)
    
    const category = await prisma.category.create({
      data: { name: cat.name }
    })

    for (const productName of cat.products) {
      await prisma.product.create({
        data: {
          name: productName,
          price: 0,
          stock: 0,
          categoryId: category.id,
          userId: user.id
        }
      })
    }
  }

  // Verify
  const totalProducts = await prisma.product.count()
  const totalCategories = await prisma.category.count()

  console.log(`\n✅ Done! Created ${totalCategories} categories and ${totalProducts} products.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())