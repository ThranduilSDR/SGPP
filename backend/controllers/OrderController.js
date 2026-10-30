const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  sequelize,
} = require("../models")

class OrderController {
  // 1. Criar Pedido (Checkout do Carrinho atual)
  static async createOrd(req, res, next) {
    const t = await sequelize.transaction()
    try {
      const userId = req.user.id

      // Buscar o carrinho do utilizador com os itens e produtos
      const cart = await Cart.findOne({
        where: { userId },
        include: {
          model: CartItem,
          include: [Product],
        },
        transaction: t,
      })

      if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        await t.rollback()
        return res.status(400).json({ message: "O seu carrinho está vazio." })
      }

      let totalAmount = 0

      // Validar estoque e calcular o valor total
      for (const item of cart.CartItems) {
        if (!item.Product || item.Product.stock < item.quantity) {
          await t.rollback()
          return res.status(422).json({
            message: `Estoque insuficiente para o produto: ${item.Product?.name || "Desconhecido"}`,
          })
        }
        totalAmount += item.Product.price * item.quantity
      }

      // Criar o Pedido
      const order = await Order.create(
        {
          userId,
          totalAmount,
          status: "PENDING",
        },
        { transaction: t },
      )

      // Criar os itens do pedido e atualizar o estoque
      for (const item of cart.CartItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.Product.price,
          },
          { transaction: t },
        )

        // Decrementar estoque
        item.Product.stock -= item.quantity
        await item.Product.save({ transaction: t })
      }

      // Esvaziar o carrinho do utilizador
      await CartItem.destroy({
        where: { cartId: cart.id },
        transaction: t,
      })

      await t.commit()

      // Retornar o pedido criado com os detalhes completos
      const createdOrder = await Order.findByPk(order.id, {
        include: {
          model: OrderItem,
          include: [Product],
        },
      })

      return res.status(201).json(createdOrder)
    } catch (error) {
      await t.rollback()
      next(error)
    }
  }

  // 2. Listar Pedidos (Se for Admin, vê todos; se for utilizador comum, vê apenas os seus)
  static async listOrd(req, res, next) {
    try {
      const userId = req.user.id
      const userRole = req.user.role

      const whereClause = userRole === "ADMIN" ? {} : { userId }

      const orders = await Order.findAll({
        where: whereClause,
        include: {
          model: OrderItem,
          include: [Product],
        },
        order: [["createdAt", "DESC"]],
      })

      return res.status(200).json(orders)
    } catch (error) {
      next(error)
    }
  }

  // 3. Obter Detalhes de um Pedido Específico
  static async detailsOrd(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const userRole = req.user.role

      const order = await Order.findByPk(id, {
        include: {
          model: OrderItem,
          include: [Product],
        },
      })

      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado." })
      }

      // Validação de segurança: Utilizador comum só pode ver os seus próprios pedidos
      if (userRole !== "ADMIN" && order.userId !== userId) {
        return res.status(403).json({ message: "Acesso negado a este pedido." })
      }

      return res.status(200).json(order)
    } catch (error) {
      next(error)
    }
  }

  // 4. Cancelar Pedido (Regra de Negócio baseada em propriedade e status)
  static async cancelOrd(req, res, next) {
    const t = await sequelize.transaction()
    try {
      const { id } = req.params
      const userId = req.user.id
      const userRole = req.user.role

      const order = await Order.findByPk(id, {
        include: {
          model: OrderItem,
          include: [Product],
        },
        transaction: t,
      })

      if (!order) {
        await t.rollback()
        return res.status(404).json({ message: "Pedido não encontrado." })
      }

      // Validação de propriedade
      if (userRole !== "ADMIN" && order.userId !== userId) {
        await t.rollback()
        return res
          .status(403)
          .json({ message: "Não tem permissão para cancelar este pedido." })
      }

      // Regra de negócio: Só pode cancelar se o pedido estiver PENDENTE
      if (order.status !== "PENDING") {
        await t.rollback()
        return res.status(422).json({
          message: `O pedido não pode ser cancelado pois encontra-se no status: ${order.status}`,
        })
      }

      // Devolver os itens de volta ao estoque dos produtos
      for (const item of order.OrderItems) {
        if (item.Product) {
          item.Product.stock += item.quantity
          await item.Product.save({ transaction: t })
        }
      }

      // Atualizar status do pedido para CANCELLED
      order.status = "CANCELLED"
      await order.save({ transaction: t })

      await t.commit()

      return res.status(200).json({
        message:
          "Pedido cancelado com sucesso e produtos devolvidos ao estoque.",
        order,
      })
    } catch (error) {
      await t.rollback()
      next(error)
    }
  }
}

module.exports = OrderController
