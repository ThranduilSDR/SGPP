const sequelize = require("../db/conn")
const User = require("./User")
const Category = require("./Category")
const Product = require("./Product")
const Cart = require("./Cart")
const CartItem = require("./CartItem")
const Order = require("./Order")
const OrderItem = require("./OrderItem")

// ---------- Carrinho ----------
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

// ---------- Pedidos ----------

// Um usuário faz vários pedidos. RESTRICT: usuário com pedidos é desativado, não apagado.
User.hasMany(Order, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "RESTRICT",
})
Order.belongsTo(User, { foreignKey: "userId", as: "user" })

// Um pedido tem vários itens.
Order.hasMany(OrderItem, {
  foreignKey: { name: "orderId", allowNull: false },
  as: "items",
  onDelete: "CASCADE",
})
OrderItem.belongsTo(Order, { foreignKey: "orderId" })

// Produto vendido é preservado no histórico: RESTRICT impede apagá-lo.
Product.hasMany(OrderItem, {
  foreignKey: { name: "productId", allowNull: false },
  onDelete: "RESTRICT",
})
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" })

// Uma categoria tem vários produtos. RESTRICT impede apagar categoria que tem produtos
// (a API deve orientar a desativação).
Category.hasMany(Product, {
  foreignKey: { name: "categoryId", allowNull: false },
  as: "products",
  onDelete: "RESTRICT",
})
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" })

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
}
