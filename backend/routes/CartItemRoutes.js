const router = require("express").Router()
const CartController = require("../controllers/CartController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.post("/", authMiddleware, CartController.addItem)
router.delete("/items", authMiddleware, CartController.removeAll)
router.put("/:id", authMiddleware, CartController.setQty)
router.delete("/:id", authMiddleware, CartController.removeItem)

module.exports = router
