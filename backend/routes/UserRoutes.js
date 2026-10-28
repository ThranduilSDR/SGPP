const router = require("express").Router()
const UserController = require("../controllers/UserController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

// As rotas abaixo exigem que o usuário esteja logado (authMiddleware)
// e que seja um Administrador (adminMiddleware)
router.post("/", authMiddleware, adminMiddleware, UserController.create)
router.get("/", authMiddleware, adminMiddleware, UserController.getAll)
router.get("/:id", authMiddleware, adminMiddleware, UserController.getUserById)
router.put("/:id", authMiddleware, adminMiddleware, UserController.update)
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  UserController.updateStatus,
) // Nova rota de alteração de status

module.exports = router
