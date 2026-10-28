const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { User } = require("../models")

class UserController {
  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body

      //validações dados preenchidos no body login
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "E-mail e senha são obrigatórios." })
      }

      const normalizedEmail = email ? String(email).trim().toLowerCase() : ""

      const user = await User.scope("withPassword").findOne({
        where: { email: normalizedEmail },
      })

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas." })
      }

      // Verificar se o usuário está ativo
      if (!user.active) {
        return res
          .status(403)
          .json({ message: "Usuário inativo. Acesso negado." })
      }

      // Comparar senha informada com o hash salvo no banco
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciais inválidas." })
      }

      // Gerar token JWT com payload contendo id e role
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      )

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (err) {
      next(err) // Encaminha para o middleware de erro do Express 5
    }
  }

  // POST /api/users (Criar usuário - Apenas ADMIN)
  static async create(req, res, next) {
    try {
      const { name, email, password, role } = req.body

      //validações
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Nome, e-mail e senha são obrigatórios." })
      }

      // Verificar se e-mail já existe
      const existingUser = await User.findOne({
        where: { email: email },
      })
      if (existingUser) {
        return res
          .status(422)
          .json({ message: "E-mail já cadastrado no sistema." })
      }

      // Gerar Hash da Senha
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      // Criar Usuário
      const newUser = await User.create({
        name,
        email,
        passwordHash,
        role: role || "OPERATOR",
        active: true,
      })

      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        createdAt: newUser.createdAt,
      })
    } catch (err) {
      next(err)
    }
  }

  // GET /api/users (Listar usuários)
  static async getAll(req, res, next) {
    try {
      const users = await User.findAll()
      return res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  }

  //Puxar o usuário atual logado
  static async getCurrentUser(req, res, next) {
    try {
      // O ID veio direto do token validado pelo middleware!
      // Como o defaultScope omite o password_hash automaticamente, basta buscar por ID!
      const user = await User.findByPk(req.user.id)

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      return res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  // PUT /api/users/:id (Atualizar usuário - PUT estrito)
  static async update(req, res, next) {
    try {
      const { id } = req.params
      const { name, email, role, active } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      // Caso e-mail seja alterado, necessário verificar se já existe em outro usuário
      if (email) {
        const normalizedEmail = email.toLowerCase().trim()
        const emailConflict = await User.findOne({
          where: { email: normalizedEmail },
        })

        // Se encontrou um usuário com esse e-mail E o ID é diferente do usuário que estamos a editar:
        if (emailConflict && emailConflict.id !== Number(id)) {
          return res.status(422).json({
            message: "Este e-mail já está a ser utilizado por outro usuário.",
          })
        }

        user.email = normalizedEmail
      }

      // Atualiza a representação completa do objeto
      user.name = name ?? user.name
      user.role = role ?? user.role
      user.active = active ?? user.active

      // Utilizando o save pois já existe a instância carregada do banco!
      await user.save()

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params

      // O defaultScope do Model já exclui o passwordHash automaticamente
      const user = await User.findByPk(id)

      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado." })
      }

      return res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params
      const { active } = req.body

      // Valida se o campo active foi enviado e se é um booleano
      if (active === undefined || typeof active !== "boolean") {
        return res
          .status(400)
          .json({ message: 'O campo "active" (true/false) é obrigatório.' })
      }

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado." })
      }

      // Medida de segurança extra: impedir que o admin desative a si próprio por engano
      if (Number(id) === req.user.id && active === false) {
        return res.status(422).json({
          message:
            "Ação negada: não pode desativar a sua própria conta de administrador.",
        })
      }

      // Atualiza o status e salva
      user.active = active
      await user.save()

      return res.status(200).json({
        message: `Utilizador ${active ? "ativado" : "desativado"} com sucesso.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id // Obtido diretamente do token pelo authMiddleware
      const { oldPassword, newPassword } = req.body

      // 1. Validar se os campos foram enviados
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "A senha atual e a nova senha são obrigatórias." })
      }

      // 2. Traz o usuário com a senha usando o scope
      const user = await User.scope("withPassword").findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." })
      }

      // 3. Verificar se a senha atual está correta
      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        user.passwordHash,
      )
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "A senha atual está incorreta." })
      }

      // 4. Validar se a nova senha é igual à antiga (opcional, mas excelente)
      if (oldPassword === newPassword) {
        return res
          .status(422)
          .json({ message: "A nova senha deve ser diferente da senha atual." })
      }

      // 5. Gerar o hash da nova senha
      const salt = await bcrypt.genSalt(10)
      const newPasswordHash = await bcrypt.hash(newPassword, salt)

      // 6. Atualizar a senha e salvar
      user.passwordHash = newPasswordHash
      await user.save()

      return res.status(200).json({ message: "Senha alterada com sucesso." })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = UserController
