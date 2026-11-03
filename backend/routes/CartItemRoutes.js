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

/**
 * @swagger
 * /api/cart/:
 *   post:
 *     summary: Adiciona um produto ao carrinho do utilizador
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: uuid-do-produto
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item adicionado/atualizado no carrinho com sucesso.
 *       404:
 *         description: Produto não encontrado.
 *       422:
 *         description: Estoque insuficiente.
 *
 * /api/cart/items:
 *   delete:
 *     summary: Remove todos os itens do carrinho (Esvazia o carrinho)
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho esvaziado com sucesso.
 *
 * /api/cart/{id}:
 *   put:
 *     summary: Atualiza a quantidade de um item específico no carrinho
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do CartItem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada com sucesso.
 *       404:
 *         description: Item não encontrado.
 *       422:
 *         description: Estoque insuficiente.
 *   delete:
 *     summary: Remove um item específico do carrinho pelo ID
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do CartItem
 *     responses:
 *       200:
 *         description: Item removido com sucesso.
 *       404:
 *         description: Item não encontrado.
 */
