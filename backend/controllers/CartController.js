const { Cart, CartItem, Product } = require("../models")

class CartController {
  // Obter o carrinho do usuário atual (com os itens e produtos detalhados)
  static async getCart(req, res, next) {
    try {
      const userId = req.user.id

      let cart = await Cart.findOne({
        where: { userId },
        include: {
          model: CartItem,
          include: [Product],
        },
      })

      // Se o usuário ainda não tiver um carrinho criado, criamos um vazio
      if (!cart) {
        cart = await Cart.create({ userId })
      }

      return res.status(200).json(cart)
    } catch (error) {
      next(error)
    }
  }

  // Adicionar item ao carrinho
  static async addItem(req, res, next) {
    try {
      const userId = req.user.id
      const { productId, quantity } = req.body

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          message: "ID do produto e uma quantidade válida são obrigatórios.",
        })
      }

      // Valida se o produto existe e tem estoque
      const product = await Product.findByPk(productId)
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado." })
      }

      if (product.stock < quantity) {
        return res
          .status(422)
          .json({ message: "Estoque insuficiente para a quantidade desejada." })
      }

      // Garante que o usuário possui um carrinho ativo
      let [cart] = await Cart.findOrCreate({ where: { userId } })

      // Verifica se o item já existe no carrinho
      let cartItem = await CartItem.findOne({
        where: { cartId: cart.id, productId },
      })

      if (cartItem) {
        cartItem.quantity += quantity
        await cartItem.save()
      } else {
        cartItem = await CartItem.create({
          cartId: cart.id,
          productId,
          quantity,
        })
      }

      // Retorna o carrinho atualizado
      const updatedCart = await Cart.findByPk(cart.id, {
        include: {
          model: CartItem,
          include: [Product],
        },
      })

      return res.status(200).json(updatedCart)
    } catch (error) {
      next(error)
    }
  }

  // Atualizar a quantidade de um item específico
  static async setQty(req, res, next) {
    try {
      const userId = req.user.id
      const { id: itemId } = req.params // ID do CartItem
      const { quantity } = req.body

      if (quantity === undefined || quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Uma quantidade válida é obrigatória." })
      }

      const cart = await Cart.findOne({ where: { userId } })
      if (!cart) {
        return res.status(404).json({ message: "Carrinho não encontrado." })
      }

      const cartItem = await CartItem.findOne({
        where: { id: itemId, cartId: cart.id },
        include: [Product],
      })

      if (!cartItem) {
        return res
          .status(404)
          .json({ message: "Item não encontrado no carrinho." })
      }

      // Valida se há estoque suficiente para a nova quantidade
      if (cartItem.Product.stock < quantity) {
        return res
          .status(422)
          .json({ message: "Estoque insuficiente para a quantidade desejada." })
      }

      cartItem.quantity = quantity
      await cartItem.save()

      // Retorna o carrinho atualizado com os itens
      const updatedCart = await Cart.findByPk(cart.id, {
        include: {
          model: CartItem,
          include: [Product],
        },
      })

      return res.status(200).json(updatedCart)
    } catch (error) {
      next(error)
    }
  }

  // Remover item específico do carrinho
  static async removeItem(req, res, next) {
    try {
      const userId = req.user.id
      const { itemId } = req.params // ID do CartItem

      const cart = await Cart.findOne({ where: { userId } })
      if (!cart) {
        return res.status(404).json({ message: "Carrinho não encontrado." })
      }

      const cartItem = await CartItem.findOne({
        where: { id: itemId, cartId: cart.id },
      })

      if (!cartItem) {
        return res
          .status(404)
          .json({ message: "Item não encontrado no carrinho." })
      }

      await cartItem.destroy()

      const updatedCart = await Cart.findByPk(cart.id, {
        include: {
          model: CartItem,
          include: [Product],
        },
      })

      return res.status(200).json(updatedCart)
    } catch (error) {
      next(error)
    }
  }

  // (Remover todos os itens do carrinho)
  static async removeAll(req, res, next) {
    try {
      const userId = req.user.id

      const cart = await Cart.findOne({ where: { userId } })
      if (!cart) {
        return res.status(404).json({ message: "Carrinho não encontrado." })
      }

      // Apaga todos os registros de CartItem vinculados a este carrinho
      await CartItem.destroy({
        where: { cartId: cart.id },
      })

      // Retorna o carrinho vazio atualizado
      const updatedCart = await Cart.findByPk(cart.id, {
        include: {
          model: CartItem,
          include: [Product],
        },
      })

      return res.status(200).json(updatedCart)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CartController
