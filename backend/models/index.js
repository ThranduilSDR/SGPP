const sequelize = require("../db/conn")
const User = require("./User")
const Product = require("./Product")
const Cart = require("./Cart")
const CartItem = require("./CartItem")

// Um usuário tem um carrinho (user_id único na tabela carts).
User.hasOne(Cart, {
  foreignKey: { name: "userId", allowNull: false, unique: true },
  onDelete: "CASCADE",
})
Cart.belongsTo(User, { foreignKey: "userId" })

// Um carrinho tem vários itens.
Cart.hasMany(CartItem, {
  foreignKey: { name: "cartId", allowNull: false },
  as: "items",
  onDelete: "CASCADE",
})
CartItem.belongsTo(Cart, { foreignKey: "cartId" })

// Cada item aponta para um produto. RESTRICT impede apagar produto que está em carrinho.
Product.hasMany(CartItem, {
  foreignKey: { name: "productId", allowNull: false },
  onDelete: "RESTRICT",
})
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" })

module.exports = { sequelize, User, Product, Cart, CartItem }
