// Popula o banco com dados iniciais. Pode ser executado várias vezes sem duplicar nada.
//   npm run seed         -> cria só o que ainda não existe
//   npm run seed:fresh   -> APAGA todas as tabelas, recria e popula (somente desenvolvimento)
const bcrypt = require("bcrypt")
const { Op } = require("sequelize")
// Ajuste se o seu models/index.js exporta a conexão com outro nome.
const { sequelize, User, Category, Product } = require("../models")

const isProduction = process.env.NODE_ENV === "production"
const fresh = process.argv.includes("--fresh")

// Em desenvolvimento usa um valor padrão; em produção exige que venha do ambiente.
function fromEnv(name, devDefault) {
  const value = process.env[name]
  if (value) return value
  if (isProduction)
    throw new Error(
      `Defina ${name} no ambiente antes de rodar o seed em produção.`,
    )
  if (devDefault === undefined) throw new Error(`Defina ${name} no .env`)
  return devDefault
}

// ---------- Dados ----------

const categories = [
  { name: "Periféricos", description: "Teclados, mouses, headsets e webcams" },
  { name: "Monitores", description: "Telas para escritório" },
  { name: "Acessórios", description: "Cabos, hubs e adaptadores" },
]

// Inclui de propósito um produto sem estoque e um inativo, para testar as regras do carrinho.
const products = [
  {
    code: "TEC-001",
    name: "Teclado mecânico ABNT2",
    category: "Periféricos",
    price: 150.0,
    stock: 40,
    active: true,
  },
  {
    code: "MOU-001",
    name: "Mouse óptico sem fio",
    category: "Periféricos",
    price: 80.0,
    stock: 60,
    active: true,
  },
  {
    code: "MON-001",
    name: 'Monitor 24" Full HD',
    category: "Monitores",
    price: 900.0,
    stock: 15,
    active: true,
  },
  {
    code: "HDS-001",
    name: "Headset USB",
    category: "Periféricos",
    price: 220.0,
    stock: 25,
    active: true,
  },
  {
    code: "HUB-001",
    name: "Hub USB-C 4 portas",
    category: "Acessórios",
    price: 130.0,
    stock: 30,
    active: true,
  },
  {
    code: "CAB-001",
    name: "Cabo HDMI 2 m",
    category: "Acessórios",
    price: 35.0,
    stock: 100,
    active: true,
  },
  {
    code: "WEB-001",
    name: "Webcam Full HD (sem estoque)",
    category: "Periféricos",
    price: 260.0,
    stock: 0,
    active: true,
  },
  {
    code: "MON-002",
    name: 'Monitor 19" (descontinuado)',
    category: "Monitores",
    price: 450.0,
    stock: 5,
    active: false,
  },
]

// ---------- Etapas ----------

async function seedUser({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase()

  // Não cria se já existe alguém com esse perfil ou com esse e-mail.

  const existing = await User.findOne({ where: { email: normalizedEmail } })
  if (existing) {
    console.log(`= ${role}: já existe (${existing.email}), mantido`)
    return
  }

  // Mesmo bcrypt do login: o compare lê o custo e o salt de dentro do próprio hash.
  const passwordHash = await bcrypt.hash(password, 12)
  await User.create({ name, email: normalizedEmail, passwordHash, role })
  console.log(`+ ${role}: criado (${normalizedEmail})`)
}

async function seedUsers() {
  await seedUser({
    name: "Administrador",
    email: fromEnv("SEED_ADMIN_EMAIL"),
    password: fromEnv("SEED_ADMIN_PASSWORD"),
    role: "ADMIN",
  })
  await seedUser({
    name: "Operador",
    email: fromEnv("SEED_OPERATOR_EMAIL"),
    password: fromEnv("SEED_OPERATOR_PASSWORD"),
    role: "OPERATOR",
  })
}

async function seedCatalog() {
  const byName = {}

  for (const data of categories) {
    // findOrCreate = busca pela chave; só cria se não achar.
    const [category, created] = await Category.findOrCreate({
      where: { name: data.name },
      defaults: data,
    })
    byName[data.name] = category
    console.log(`${created ? "+" : "="} categoria: ${data.name}`)
  }

  for (const { category, ...data } of products) {
    const [, created] = await Product.findOrCreate({
      where: { code: data.code }, // code é único
      defaults: { ...data, categoryId: byName[category].id },
    })
    console.log(`${created ? "+" : "="} produto: ${data.code}`)
  }
}

async function main() {
  if (fresh && isProduction) throw new Error("--fresh é bloqueado em produção.")

  await sequelize.authenticate()

  if (fresh) {
    console.log("Recriando todas as tabelas (force)...")
    await sequelize.sync({ force: true })
  } else {
    await sequelize.sync() // só garante que as tabelas existem; não altera as existentes
  }

  await seedUsers()
  await seedCatalog()
  console.log("Seed concluído.")
}

main()
  .catch((err) => {
    console.error("Seed falhou:", err.message)
    process.exitCode = 1
  })
  .finally(() => sequelize.close()) // sem isso o processo fica preso no pool de conexões
