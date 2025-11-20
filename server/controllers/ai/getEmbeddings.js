import OpenAI from "openai";
import Employee from "../../models/employees/employeeModel.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use OpenAI’s free embedding model
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function getEmbedding(text, employeeId = null) {
  if (!text) throw new Error("❌ Empty text for embedding");

  const normalized = text.trim().toLowerCase();

  // 1️⃣ Check Employee Cache First
  if (employeeId) {
    const emp = await Employee.findById(employeeId).select("skillEmbeddings");
    const cached = emp?.skillEmbeddings?.find(
      (s) => s.skill.toLowerCase() === normalized
    );

    if (cached) {
      // console.log("✨ Using cached embedding:", normalized);
      return cached.embedding;
    }
  }

  // 2️⃣ Fetch fresh embedding from OpenAI
  let embedding;
  try {
    const res = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: normalized,
    });

    embedding = res.data[0].embedding; 
  } catch (err) {
    console.error("❌ OpenAI Embedding Error:", err);
    throw new Error("Embedding service unavailable");
  }

  // 3️⃣ Cache embedding into employee document
  if (employeeId) {
    await Employee.findByIdAndUpdate(employeeId, {
      $pull: { skillEmbeddings: { skill: normalized } }, // remove old
    });

    await Employee.findByIdAndUpdate(employeeId, {
      $push: {
        skillEmbeddings: {
          skill: normalized,
          embedding,
          updatedAt: new Date(),
        },
      },
    });
  }

  return embedding;
}
