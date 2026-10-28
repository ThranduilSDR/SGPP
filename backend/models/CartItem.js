const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

// As chaves estrangeiras cart_id e product_id são criadas em models/index.js.
const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  {
    tableName: "cart_items",
    underscored: true,
    // O mesmo produto não pode aparecer duas vezes no mesmo carrinho.
    indexes: [{ unique: true, fields: ["cart_id", "product_id"] }],
  },
)

module.exports = CartItem
