const { Sequelize } = require("sequelize")

// Uma única instância de conexão, reaproveitada por todos os models.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    //para verificar via console o SQL gerado
    //logging: console.log,
    logging: false,
  },
)

module.exports = sequelize
