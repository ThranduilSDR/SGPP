const router = require("express").Router()
const CartController = require("../controllers/CartController")

//Middlewares de verificação JWT/ADMIN
const authMiddleware = require("../middlewares/authMiddleware")

// Rotas acessíveis a qualquer utilizador autenticado (Consulta)
router.get("/", authMiddleware, CartController.getCart)

module.exports = router

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtém o carrinho do utilizador autenticado
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado com sucesso.
 *       404:
 *         description: Carrinho não encontrado.
 */
