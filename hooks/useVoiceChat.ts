import { useState } from "react";
import { askLLM } from "../services/llmservices";

export function useVoiceChat() {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking">("idle");

  const sendMessage = async (text: string): Promise<string | null> => {
    setStatus("thinking");
    try {
      const reply = await askLLM(text);
      setResponse(reply);
      return reply;
    } catch (err) {
      console.error(err);
      alert("LM Studio se is not working properly check your server");
      return null;
    } finally {
      setStatus("idle");
    }
  };

  return { response, status, sendMessage };
}
