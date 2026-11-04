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
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        transaction: t,
      })

      // Valida se o carrinho existe e se a propriedade 'items' contém registros
      if (!cart || !cart.items || cart.items.length === 0) {
        await t.rollback()
        return res.status(400).json({ message: "O seu carrinho está vazio." })
      }

      let totalAmount = 0

      // Validar estoque e calcular o valor total
      for (const item of cart.items) {
        if (!item.product || item.product.stock < item.quantity) {
          await t.rollback()
          return res.status(422).json({
            message: `Estoque insuficiente para o produto: ${item.product?.name || "Desconhecido"}`,
          })
        }
        totalAmount += Number(item.product.price) * Number(item.quantity)
      }

      // Criar o Pedido
      const order = await Order.create(
        {
          userId,
          subtotal: totalAmount,
          total: totalAmount,
          status: "FINALIZADO",
        },
        { transaction: t },
      )

      // Criar os itens do pedido e atualizar o estoque

      for (const item of cart.items) {
        const unitPrice = Number(item.product.price)
        const quantity = Number(item.quantity)
        const subtotal = Number((unitPrice * quantity).toFixed(2)) // Arredonda para 2 casas e converte para Number

        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            unitPrice: unitPrice,
            quantity: quantity,
            subtotal: subtotal,
          },
          { transaction: t },
        )

        // Decrementar estoque do produto associado
        item.product.stock -= item.quantity
        await item.product.save({ transaction: t })
      }

      // Esvaziar o carrinho do utilizador após o checkout bem-sucedido
      await CartItem.destroy({
        where: { cartId: cart.id },
        transaction: t,
      })

      await t.commit()

      // Retornar o pedido criado com os detalhes completos
      const createdOrder = await Order.findByPk(order.id, {
        include: {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
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
          as: "items",
          include: [{ model: Product, as: "product" }],
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
          as: "items",
          include: [{ model: Product, as: "product" }],
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
          as: "items",
          include: [{ model: Product, as: "product" }],
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

      // Regra de negócio: Só pode cancelar se o pedido estiver Finalizado
      if (order.status !== "FINALIZADO") {
        await t.rollback()
        return res.status(422).json({
          message: `O pedido não pode ser cancelado pois encontra-se no status: ${order.status}`,
        })
      }

      // Devolver os itens de volta ao estoque dos produtos (usando order.items e item.product)
      for (const item of order.items) {
        if (item.product) {
          item.product.stock += item.quantity
          await item.product.save({ transaction: t })
        }
      }

      // Atualizar status do pedido para CANCELLED
      order.status = "CANCELADO"
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
