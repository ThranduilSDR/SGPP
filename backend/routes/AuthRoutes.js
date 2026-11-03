const router = require("express").Router()
const UserController = require("../controllers/UserController")
const authMiddleware = require("../middlewares/authMiddleware")

// Rota pública (não exige token)
router.post("/login", UserController.login)

// Rotas protegidas (exigem que o usuário envie um token válido no Header)
router.get("/me", authMiddleware, UserController.getCurrentUser)
router.post("/change-password", authMiddleware, UserController.changePassword)

module.exports = router

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza a autenticação do utilizador
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@sgpp.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login bem-sucedido com retorno do token JWT.
 *       401:
 *         description: Credenciais inválidas ou utilizador inativo.
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna os dados do utilizador atualmente autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do utilizador obtidos com sucesso.
 *       401:
 *         description: Token não fornecido, expirado ou inválido.
 *       404:
 *         description: Utilizador não encontrado.
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Altera a senha do utilizador autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: NovaSenha@123
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso.
 *       401:
 *         description: Senha atual incorreta ou token inválido.
 *       400:
 *         description: Campos obrigatórios ausentes ou inválidos.
 */
