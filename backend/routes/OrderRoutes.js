const router = require("express").Router()
const OrderController = require("../controllers/OrderController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.post("/", authMiddleware, OrderController.createOrd)
router.get("/", authMiddleware, OrderController.listOrd)
router.get("/:id", authMiddleware, OrderController.detailsOrd)
router.put("/:id/cancel", authMiddleware, OrderController.cancelOrd)

module.exports = router
