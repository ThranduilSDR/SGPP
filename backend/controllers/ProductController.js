const { Product, Category } = require("../models")

class ProductController {
  // Criar Produto (Admin)
  static async create(req, res, next) {
    try {
      const { name, description, price, stock, categoryId } = req.body

      if (!name || price === undefined || stock === undefined || !categoryId) {
        return res.status(400).json({
          message: "Nome, preço, estoque e categoria são obrigatórios.",
        })
      }

      // Valida se a categoria informada existe
      const category = await Category.findByPk(categoryId)
      if (!category) {
        return res
          .status(404)
          .json({ message: "A categoria informada não existe." })
      }

      const product = await Product.create({
        name,
        description,
        price,
        stock,
        categoryId,
      })

      return res.status(201).json(product)
    } catch (error) {
      next(error)
    }
  }

  // Listar todos os produtos (trazendo dados da categoria)
  static async getAll(req, res, next) {
    try {
      const products = await Product.findAll({
        include: [{ model: Category, attributes: ["id", "name"] }],
      })
      return res.status(200).json(products)
    } catch (error) {
      next(error)
    }
  }

  // Buscar produto por ID
  static async getPdtById(req, res, next) {
    try {
      const { id } = req.params
      const product = await Product.findByPk(id, {
        include: [{ model: Category }],
      })

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado." })
      }

      return res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  // Atualizar produto (PUT estrito)
  static async update(req, res, next) {
    try {
      const { id } = req.params
      const { name, description, price, stock, categoryId } = req.body

      const product = await Product.findByPk(id)
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado." })
      }

      if (categoryId) {
        const category = await Category.findByPk(categoryId)
        if (!category) {
          return res
            .status(404)
            .json({ message: "A categoria informada não existe." })
        }
        product.categoryId = categoryId
      }

      product.name = name ?? product.name
      product.description = description ?? product.description
      product.price = price ?? product.price
      product.stock = stock ?? product.stock

      await product.save()
      return res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  // Excluir produto
  static async delete(req, res, next) {
    try {
      const { id } = req.params
      const product = await Product.findByPk(id)

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado." })
      }

      await product.destroy()
      return res.status(200).json({ message: "Produto excluído com sucesso." })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = ProductController
