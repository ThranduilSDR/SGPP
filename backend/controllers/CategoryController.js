const { Category, Product } = require("../models")

class CategoryController {
  // Criar Categoria (Admin)
  static async create(req, res, next) {
    try {
      const { name, description } = req.body

      if (!name) {
        return res
          .status(400)
          .json({ message: "O nome da categoria é obrigatório." })
      }

      const category = await Category.create({ name, description })
      return res.status(201).json(category)
    } catch (error) {
      next(error)
    }
  }

  // Listar todas as categorias
  static async getAll(req, res, next) {
    try {
      const categories = await Category.findAll()
      return res.status(200).json(categories)
    } catch (error) {
      next(error)
    }
  }

  // Buscar categoria por ID (incluindo os produtos relacionados)
  static async getCtgById(req, res, next) {
    try {
      const { id } = req.params
      const category = await Category.findByPk(id, {
        include: [{ model: Product }],
      })

      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada." })
      }

      return res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  // Atualizar categoria (PUT estrito)
  static async update(req, res, next) {
    try {
      const { id } = req.params
      const { name, description } = req.body

      const category = await Category.findByPk(id)
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada." })
      }

      category.name = name ?? category.name
      category.description = description ?? category.description
      await category.save()

      return res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  // Excluir categoria
  static async delete(req, res, next) {
    try {
      const { id } = req.params
      const category = await Category.findByPk(id)

      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada." })
      }

      await category.destroy()
      return res
        .status(200)
        .json({ message: "Categoria excluída com sucesso." })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CategoryController
