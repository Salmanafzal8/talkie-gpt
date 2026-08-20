import { LM_STUDIO_URL, LM_STUDIO_MODEL_NAME } from "../constants/config";

export async function askLLM(userText: string): Promise<string> {
  const response = await fetch(LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL_NAME,
      messages: [
        { role: "system", content: "Tum ek madadgar voice assistant ho. Chhote, seedhe jawab do." },
        { role: "user", content: userText },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`LM Studio error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}