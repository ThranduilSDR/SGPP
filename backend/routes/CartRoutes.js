const router = require("express").Router()
const CartController = require("../controllers/CartController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.get("/", authMiddleware, CartController.getCart)

module.exports = router
