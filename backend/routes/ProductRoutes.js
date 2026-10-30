const router = require("express").Router()
const ProductController = require("../controllers/ProductController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.get("/", authMiddleware, ProductController.getAll)
router.get("/:id", authMiddleware, ProductController.getPdtById)

// Rotas exclusivas para Administradores (Modificação)
router.post("/", authMiddleware, adminMiddleware, ProductController.create)
router.put("/:id", authMiddleware, adminMiddleware, ProductController.update)
router.delete("/:id", authMiddleware, adminMiddleware, ProductController.delete)

module.exports = router
