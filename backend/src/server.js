const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// Public folder for images
app.use(express.static(`public`))

// Rota de teste: Através de um GET na URL retorna json que o servidor está respondendo.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Configurando a rota da documentação (Implementar Swagger futuramente)

//Routes - API
const AuthRoutes = require(`../routes/AuthRoutes`)
const UserRoutes = require(`../routes/UserRoutes`)
const ProductRoutes = require(`./routes/ProductRoutes`)
const CartRoutes = require(`./routes/CartRoutes`)

app.use("/api/auth", AuthRoutes)
app.use("/api/users", UserRoutes)
app.use("/api/products", ProductRoutes)
app.use("/api/cart", CartRoutes)

// Middleware tratador de erros Express 5 - erros lançados dentro de
// handlers async chegam aqui sozinhos, sem precisar de try/catch em todo lugar.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Erro interno do servidor." })
})

module.exports = app
