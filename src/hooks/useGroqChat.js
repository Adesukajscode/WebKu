import { useState, useCallback, useRef } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useGroqChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (content) => {
    const userMsg = { id: Date.now(), role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsLoading(true);
    abortRef.current = false;

    try {
      const stream = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten AI yang ramah, cerdas, dan membantu. Jawab dengan jelas dan ringkas dalam bahasa Indonesia. Gunakan markdown bila perlu.",
          },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const assistantId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      let fullText = "";
      for await (const chunk of stream) {
        if (abortRef.current) break;
        const delta = chunk.choices[0]?.delta?.content || "";
        fullText += delta;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullText } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err) {
      console.error("Groq error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "⚠️ Maaf, terjadi kesalahan. Coba lagi ya.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const stop = useCallback(() => {
    abortRef.current = true;
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, stop, clear };
}
