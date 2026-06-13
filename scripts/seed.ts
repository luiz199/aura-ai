import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aura-ai"

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  const existing = await db.collection("users").findOne({ email: "admin@aura.ai" })
  if (existing) {
    console.log("Usu\u00e1rio admin j\u00e1 existe.")
    await client.close()
    return
  }

  const hash = await bcrypt.hash("admin123", 10)
  await db.collection("users").insertOne({
    nome: "Administrador",
    email: "admin@aura.ai",
    password: hash,
    tipo: "admin",
    createdAt: new Date(),
    preferences: { theme: "dark", language: "pt-BR", notifications: true },
  })

  console.log("Usu\u00e1rio admin criado!")
  console.log("  Email: admin@aura.ai")
  console.log("  Senha: admin123")
  console.log("  Tipo: admin")

  await client.close()
}

seed().catch(console.error)
