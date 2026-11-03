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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo utilizador (Apenas Admin)
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nome do Utilizador
 *               email:
 *                 type: string
 *                 example: usuario@sgpp.com
 *               password:
 *                 type: string
 *                 example: Senha123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OPERATOR]
 *                 example: OPERATOR
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso.
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso restrito a administradores.
 *   get:
 *     summary: Lista todos os utilizadores (Apenas Admin)
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de utilizadores retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso restrito a administradores.
 *
 * /api/users/{id}:
 *   get:
 *     summary: Busca um utilizador pelo ID (Apenas Admin)
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Utilizador encontrado.
 *       404:
 *         description: Utilizador não encontrado.
 *   put:
 *     summary: Atualiza os dados de um utilizador (Apenas Admin)
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilizador atualizado com sucesso.
 *       404:
 *         description: Utilizador não encontrado.
 *
 * /api/users/{id}/status:
 *   put:
 *     summary: Altera o status (ativo/inativo) do utilizador (Apenas Admin)
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Status do utilizador alterado com sucesso.
 *       404:
 *         description: Utilizador não encontrado.
 */
