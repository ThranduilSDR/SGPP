const { Cart, CartItem, Product } = require("../models")

class CartController {
  // MÉTODO AUXILIAR PRIVADO: Calcula o total e formata o JSON
  static _formatCart(cart) {
    if (!cart) return null

    const cartJson = cart.toJSON ? cart.toJSON() : cart
    let totalAmount = 0

    // Utiliza 'items' (conforme o alias definido no index.js)
    if (cartJson.items && cartJson.items.length > 0) {
      cartJson.items.forEach((item) => {
        // Converte o DECIMAL (string) do Postgres para Number e calcula
        const price = Number(item.product?.price || 0)
        const quantity = Number(item.quantity || 0)
        totalAmount += price * quantity
      })
    }

    cartJson.totalAmount = Number(totalAmount.toFixed(2))
    return cartJson
  }

  // Obter o carrinho do usuário atual (com os itens e produtos detalhados)
  static async getCart(req, res, next) {
    try {
      const userId = req.user.id

      let cart = await Cart.findOne({
        where: { userId },
        include: {
          model: CartItem,
          as: "items", // Alias definido no index.js para o CartItem
          include: [
            {
              model: Product,
              as: "product", // Alias definido no index.js para o Product
            },
          ],
        },
      })

      // Se o usuário ainda não tiver um carrinho criado, criamos um vazio
      if (!cart) {
        cart = await Cart.create({ userId })
        // Recarrega o carrinho recém-criado para trazer a estrutura de associações vazia
        cart = await Cart.findByPk(cart.id, {
          include: {
            model: CartItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        })
      }

      return res.status(200).json(CartController._formatCart(cart))
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
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      })

      return res.status(200).json(CartController._formatCart(updatedCart))
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
        include: [{ model: Product, as: "product" }],
      })

      if (!cartItem) {
        return res
          .status(404)
          .json({ message: "Item não encontrado no carrinho." })
      }

      // Valida se há estoque suficiente para a nova quantidade
      if (cartItem.product.stock < quantity) {
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
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      })

      return res.status(200).json(CartController._formatCart(updatedCart))
    } catch (error) {
      next(error)
    }
  }

  // Remover item específico do carrinho
  static async removeItem(req, res, next) {
    try {
      const userId = req.user.id
      const { id } = req.params // Captura diretamente o 'id' enviado na URL

      const cart = await Cart.findOne({ where: { userId } })
      if (!cart) {
        return res.status(404).json({ message: "Carrinho não encontrado." })
      }

      // Passa a variável 'id' explicitamente para o where
      const cartItem = await CartItem.findOne({
        where: { id: id, cartId: cart.id },
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
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      })

      return res.status(200).json(CartController._formatCart(updatedCart))
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
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      })

      return res.status(200).json(CartController._formatCart(updatedCart))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CartController
