import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read environment variables manually from .env or .env.local
function loadEnv() {
  const envFiles = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const apiKey = process.env.BHARATCODE_API_KEY;
const baseUrl = process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1";
const model = process.env.BHARATCODE_MODEL || "qwen-3.8-27b";

console.log("=== BHARATCODE SMOKE TEST ===");
console.log(`Base URL: ${baseUrl}`);
console.log(`Model: ${model}`);
console.log(`API Key set: ${!!apiKey} (length: ${apiKey ? apiKey.length : 0})`);

if (!apiKey) {
  console.error("❌ BHARATCODE_API_KEY not found!");
  process.exit(1);
}

async function testModels() {
  console.log("\n[1/3] Testing GET /models...");
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("Available models:", JSON.stringify(data, null, 2));
    if (res.ok) {
      console.log("✅ GET /models succeeded!");
    } else {
      console.error("❌ GET /models returned non-200:", data);
    }
  } catch (err) {
    console.error("❌ Error fetching /models:", err.message);
  }
}

async function testSimpleChat() {
  console.log("\n[2/3] Testing POST /chat/completions (OpenAI compatible)...");
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: "Reply in exactly 5 words: Confirming BharatCode API is live and responding." },
        ],
        max_tokens: 50,
      }),
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response text:", text);

    if (res.ok) {
      console.log("✅ Chat completions succeeded!");
    }
  } catch (err) {
    console.error("❌ Error in chat completions:", err.message);
  }
}

async function testResponsesEndpoint() {
  console.log("\n[3/3] Testing POST /responses with store:false...");
  try {
    const res = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        input: [
          { role: "user", content: "Explain section 143(1) of Indian Income Tax Act in 1 brief sentence." },
        ],
        store: false,
        max_output_tokens: 150,
      }),
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Responses output:", text);

    if (res.ok) {
      console.log("✅ /responses endpoint succeeded!");
    }
  } catch (err) {
    console.error("❌ Error in /responses:", err.message);
  }
}

async function run() {
  await testModels();
  await testSimpleChat();
  await testResponsesEndpoint();
  console.log("\n=== SMOKE TEST FINISHED ===");
}

run();
