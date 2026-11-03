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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista todos os produtos cadastrados
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso.
 *   post:
 *     summary: Cadastra um novo produto (Apenas Admin)
 *     tags: [Produtos]
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
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Notebook Gamer
 *               description:
 *                 type: string
 *                 example: 16GB RAM, SSD 512GB
 *               price:
 *                 type: number
 *                 example: 4500.00
 *               stock:
 *                 type: integer
 *                 example: 15
 *               categoryId:
 *                 type: string
 *                 example: uuid-da-categoria
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *       400:
 *         description: Campos obrigatórios ausentes.
 *       404:
 *         description: Categoria não encontrada.
 *
 * /api/products/{id}:
 *   get:
 *     summary: Obtém os detalhes de um produto pelo ID
 *     tags: [Produtos]
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
 *         description: Produto encontrado.
 *       404:
 *         description: Produto não encontrado.
 *   put:
 *     summary: Atualiza um produto existente (Apenas Admin)
 *     tags: [Produtos]
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
 *         description: Produto atualizado com sucesso.
 *       404:
 *         description: Produto não encontrado.
 *   delete:
 *     summary: Remove um produto do catálogo (Apenas Admin)
 *     tags: [Produtos]
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
 *         description: Produto excluído com sucesso.
 *       404:
 *         description: Produto não encontrado.
 */
