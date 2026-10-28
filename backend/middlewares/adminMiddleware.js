const adminMiddleware = (req, res, next) => {
  // req.user foi preenchido pelo authMiddleware que rodou antes!
  if (!req.user || req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Acesso negado. Requer privilégios de Administrador." })
  }

  return next()
}

module.exports = adminMiddleware
