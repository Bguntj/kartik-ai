from chatbot import ask_gemini
from memory import save_chat

@app.post("/chat")
def chat(req: ChatRequest):

    answer = ask_gemini(req.message)

    save_chat(req.message, answer)

    return {
        "reply": answer
    }