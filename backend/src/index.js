const app = require("./server")
const { sequelize } = require("../models")

async function startServer() {
  await sequelize.authenticate() // falha com mensagem clara se o banco estiver fora
  await sequelize.sync() // cria as tabelas que ainda não existem (migrations ficam para depois)
  //sync({ force: true })
  console.log("Conectado ao PostgreSQL com sucesso!")

  //chamada para conexão com banco passando a porta disponível na variavel protegida de ambiente .env
  const port = process.env.PORT || 5000
  app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
}

startServer().catch((err) => {
  console.error("Falha ao iniciar:", err)
  process.exit(1)
})
