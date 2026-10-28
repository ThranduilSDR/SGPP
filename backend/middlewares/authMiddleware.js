const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  // 1. Verifica se o header Authorization foi enviado
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token de autenticação não fornecido." })
  }

  // O formato esperado é "Bearer <token>"
  const parts = authHeader.split(" ")
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Erro no formato do token." })
  }

  const [scheme, token] = parts

  // Valida se o prefixo Bearer está presente
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: "Token mal formatado." })
  }

  // 2. Valida o token usando a chave secreta do .env
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido ou expirado." })
    }

    // 3. Insere os dados do usuário (id e role) na requisição para uso posterior
    req.user = {
      id: decoded.id,
      role: decoded.role,
    }

    return next() // Libera a rota para continuar rumo ao Controller
  })
}

module.exports = authMiddleware
