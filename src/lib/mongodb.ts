import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aura-ai"
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, options)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function getClient() {
  return clientPromise
}

export async function getDB() {
  const client = await getClient()
  return client.db()
}
