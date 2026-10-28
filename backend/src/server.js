const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// Rota de teste: serve para provar que o servidor está de pé.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Configurando a rota da documentação (Implementar Swagger futuramente)

//Routes - API

// Middleware tratador de erros Express 5 - erros lançados dentro de
// handlers async chegam aqui sozinhos, sem precisar de try/catch em todo lugar.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Erro interno do servidor." })
})

module.exports = app
