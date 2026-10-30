const router = require("express").Router()
const CategoryController = require("../controllers/CategoryController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.get("/", authMiddleware, CategoryController.getAll)
router.get("/:id", authMiddleware, CategoryController.getCtgById)

// Rotas exclusivas para Administradores (Modificação)
router.post("/", authMiddleware, adminMiddleware, CategoryController.create)
router.put("/:id", authMiddleware, adminMiddleware, CategoryController.update)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  CategoryController.delete,
)

module.exports = router
