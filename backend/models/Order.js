const crypto = require("node:crypto")
const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

// Exemplo: PED-20261030-A1B2C3. Não é sequencial; a unicidade é garantida
// pela constraint UNIQUE do banco (colisão é muito improvável).
function generateOrderNumber() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `PED-${day}-${suffix}`
}

// A chave estrangeira user_id é criada em models/index.js.
const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM("FINALIZADO", "CANCELADO"),
      allowNull: false,
      defaultValue: "FINALIZADO",
    },
    // Valores calculados no servidor no fechamento. discount fica 0 nesta versão.
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "orders",
    underscored: true,
    hooks: {
      // Roda antes da validação, então allowNull: false não reclama do número ausente.
      beforeValidate(order) {
        if (!order.number) order.number = generateOrderNumber()
      },
    },
    // Índices para os filtros da listagem (usuário, status e período).
    indexes: [
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  },
)

module.exports = Order
