const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SGPP - Sistema de Gestão Corporativa API",
      version: "1.0.0",
      description:
        "Documentação oficial das rotas do backend com autenticação JWT e RBAC.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Servidor Local de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Insira o token JWT obtido no login no formato: Bearer <seu_token>",
        },
      },
    },
  },
  // Caminho para os arquivos onde você vai documentar as rotas (pode apontar para as rotas ou controllers)
  apis: ["./routes/*.js"],
}

const swaggerSpec = swaggerJSDoc(options)

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  console.log(
    "📄 Documentação Swagger disponível em: http://localhost:5000/api-docs",
  )
}

module.exports = swaggerDocs
