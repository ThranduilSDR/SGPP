const router = require("express").Router()
const UserController = require("../controllers/UserController")
const authMiddleware = require("../middlewares/authMiddleware")

// Rota pública (não exige token)
router.post("/login", UserController.login)

// Rotas protegidas (exigem que o usuário envie um token válido no Header)
router.get("/me", authMiddleware, UserController.getCurrentUser)
router.post("/change-password", authMiddleware, UserController.changePassword)

module.exports = router
