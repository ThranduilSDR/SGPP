const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

// Cada linha guarda uma "fotografia" do produto no momento da venda.
// O histórico nunca deve ser recalculado a partir da tabela products.
// As chaves estrangeiras order_id e product_id são criadas em models/index.js.
const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productName: { type: DataTypes.STRING, allowNull: false },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "order_items",
    underscored: true,
    indexes: [{ fields: ["order_id"] }],
  },
)

module.exports = OrderItem
