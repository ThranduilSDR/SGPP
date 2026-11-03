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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Realiza o checkout criando um pedido a partir do carrinho atual
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso e estoque atualizado.
 *       400:
 *         description: Carrinho vazio.
 *       422:
 *         description: Estoque insuficiente para algum dos produtos.
 *   get:
 *     summary: Lista os pedidos (Admin vê todos, utilizador comum vê apenas os seus)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso.
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Obtém os detalhes de um pedido específico
 *     tags: [Pedidos]
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
 *         description: Detalhes do pedido retornados com sucesso.
 *       403:
 *         description: Acesso negado ao pedido de outro utilizador.
 *       404:
 *         description: Pedido não encontrado.
 *
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancela um pedido pendente e devolve os itens ao estoque
 *     tags: [Pedidos]
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
 *         description: Pedido cancelado e estoque restaurado com sucesso.
 *       403:
 *         description: Sem permissão para cancelar este pedido.
 *       422:
 *         description: Pedido não está com status PENDENTE e não pode ser cancelado.
 *       404:
 *         description: Pedido não encontrado.
 */
