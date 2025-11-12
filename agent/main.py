from fastapi import FastAPI
from pydantic import BaseModel, ValidationError
from datetime import datetime
import os, json, re
import pymongo
from dotenv import load_dotenv
import google.generativeai as genai

# 🌍 Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in environment variables!")

# 🔑 Configure Gemini
genai.configure(api_key=api_key)

# ⚙️ FastAPI app
app = FastAPI()

# 🧩 MongoDB connection
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["SmartOfficeVA"]
leaves = db["leaves"]

# 🧱 Request model
class LeaveRequest(BaseModel):
    message: str
    employeeId: str

# ✅ Response validation schema
class ParsedLeave(BaseModel):
    startDate: str | None = None
    endDate: str | None = None
    reason: str
    priority: str | None = "MEDIUM"

# 🧭 Utility: Convert "DD-MM-YYYY" → ISO 8601 (YYYY-MM-DD)
def convert_to_iso(date_str: str | None):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").isoformat()
    except ValueError:
        print(f"⚠️ Invalid date format received: {date_str}")
        return None


@app.post("/analyze")
async def analyze(req: LeaveRequest):
    """
    Step 1️⃣ Extract structured leave info from employee message.
    Step 2️⃣ Generate a natural language acknowledgment.
    Step 3️⃣ Save structured + conversational data in MongoDB.
    """

    try:
        # 🧠 Step 1: Strict JSON extraction prompt
        extract_prompt = f"""
You are a strict HR data extraction AI.

Your task: From the employee's message, extract these fields:
- startDate (DD-MM-YYYY)
- endDate (DD-MM-YYYY)
- reason
- priority (HIGH, MEDIUM, LOW)

Rules:
- Respond ONLY in valid JSON format.
- Do NOT include explanations or markdown.
- Use null if a field is missing.

Employee message:
"{req.message}"

Example output:
{{
  "startDate": "13-11-2025",
  "endDate": "15-11-2025",
  "reason": "medical emergency",
  "priority": "HIGH"
}}
"""

        extract_model = genai.GenerativeModel("gemini-2.0-flash")
        extract_response = extract_model.generate_content(extract_prompt)

        raw_text = extract_response.text.strip()
        print("🧾 Raw LLM output:", raw_text)

        # 🧹 Clean up model text
        raw_text = re.sub(r"^```[a-zA-Z]*|```$", "", raw_text).strip()

        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if not match:
            raise ValueError("Model did not return valid JSON")

        clean_json = match.group(0)
        data = json.loads(clean_json)
        data["employeeId"] = req.employeeId

        # ✅ Validate structure with Pydantic
        try:
            parsed = ParsedLeave(**data)
        except ValidationError as ve:
            print("Validation error:", ve)
            raise ValueError("Invalid structured output from model")

        # 🗓️ Convert dates before saving
        parsed_dict = parsed.dict()
        parsed_dict["startDate"] = convert_to_iso(parsed_dict.get("startDate"))
        parsed_dict["endDate"] = convert_to_iso(parsed_dict.get("endDate"))

        # 🧠 Step 2: Generate a polite AI reply
        reply_prompt = f"""
You are a friendly HR assistant.
Here is the parsed leave request:
{json.dumps(parsed_dict, indent=2)}

Write a short, polite acknowledgment to the employee confirming their leave request.
Example: "Got it, I’ve noted your 2-day leave from 5th to 6th November for personal work. It’s being processed."
"""

        reply_model = genai.GenerativeModel("gemini-2.0-flash")
        reply_response = reply_model.generate_content(reply_prompt)
        ai_reply = reply_response.text.strip()

        # 🗄️ Step 3: Save in MongoDB
        leaves.insert_one({
            **parsed_dict,
            "employeeId": req.employeeId,
            "aiReply": ai_reply
        })

        # 🎯 Return structured + conversational reply
        return {
            "status": "success",
            "parsed": parsed_dict,
            "aiReply": ai_reply
        }

    except Exception as e:
        print("❌ Error:", e)
        return {"status": "error", "message": str(e)}
