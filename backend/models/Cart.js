const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

// A chave estrangeira user_id é criada em models/index.js, nas associações.
const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  { tableName: "carts", underscored: true },
)

module.exports = Cart
