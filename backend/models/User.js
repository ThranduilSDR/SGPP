const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      //validação para entrada do dado e-mail junto ao banco
      validate: { isEmail: true },
      // Normaliza antes de salvar: " Ana@Mail.com " vira "ana@mail.com".
      set(value) {
        this.setDataValue("email", String(value).trim().toLowerCase())
      },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("ADMIN", "OPERATOR"),
      allowNull: false,
      defaultValue: "OPERATOR",
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: "users",
    underscored: true, // createdAt vira created_at, passwordHash vira password_hash
    // A senha nunca sai nas consultas normais.
    // No login, necessário User.scope('withPassword').findOne(...) para trazê-la.
    defaultScope: { attributes: { exclude: ["passwordHash"] } },
    scopes: { withPassword: {} },
  },
)

module.exports = User
