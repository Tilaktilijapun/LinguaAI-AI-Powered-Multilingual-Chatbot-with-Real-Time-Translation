import { MongoClient } from "mongodb";

const inMemoryHistory = [];
let collection;

export async function initChatStore() {
  if (!process.env.MONGODB_URI) {
    console.log("MongoDB URI not set, using in-memory chat history.");
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const database = client.db(process.env.MONGODB_DB || "linguaai");
  collection = database.collection("chats");
  console.log("Connected to MongoDB chat store.");
}

export async function saveChat(chatRecord) {
  if (collection) {
    await collection.insertOne(chatRecord);
    return;
  }

  inMemoryHistory.push(chatRecord);
}

export async function listChatHistory(limit = 20) {
  if (collection) {
    return collection.find().sort({ createdAt: -1 }).limit(limit).toArray();
  }

  return [...inMemoryHistory].reverse().slice(0, limit);
}
