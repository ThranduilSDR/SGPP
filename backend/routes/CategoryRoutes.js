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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias cadastradas
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso.
 *   post:
 *     summary: Cria uma nova categoria (Apenas Admin)
 *     tags: [Categorias]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Eletrônicos
 *               description:
 *                 type: string
 *                 example: Dispositivos eletrônicos e gadgets
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso.
 *       400:
 *         description: Nome obrigatório em falta.
 *
 * /api/categories/{id}:
 *   get:
 *     summary: Busca uma categoria específica pelo ID
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria encontrada.
 *       404:
 *         description: Categoria não encontrada.
 *   put:
 *     summary: Atualiza uma categoria (Apenas Admin)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso.
 *       404:
 *         description: Categoria não encontrada.
 *   delete:
 *     summary: Exclui uma categoria (Apenas Admin)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso.
 *       404:
 *         description: Categoria não encontrada.
 */
