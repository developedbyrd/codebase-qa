import axios from "axios";
import { config } from "../configs/config.js";
import {
  OPENROUTER_URL,
  DEFAULT_MODEL,
  LLM_MAX_TOKENS,
  LLM_TEMPERATURE,
  SYSTEM_PROMPT,
} from "../utils/constants.util.js";

function buildUserMessage(question, contextForLlm) {
  return `Here is the context from the codebase:\n\n${contextForLlm}\n\n---\n\nQuestion: ${question}\n\nPlease provide a helpful answer based on the available context.`;
}

export async function askLlm(question, contextForLlm) {
  const apiKey = config.openRouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(question, contextForLlm) },
        ],
        max_tokens: LLM_MAX_TOKENS,
        temperature: LLM_TEMPERATURE,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": config.appUrl,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error("Invalid response from OpenRouter");
    }

    return choice.message.content.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("LLM Axios Error:", error.response?.data || error.message);
    } else {
      console.error("LLM Error:", error);
    }

    return `I encountered an issue processing your question. Based on the project files I can see:\n\n${contextForLlm.split("\n").slice(0, 10).join("\n")}\n\nPlease try asking a more specific question.`;
  }
}

export async function checkLlmConnection() {
  try {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) return "error";

    await axios.post(
      OPENROUTER_URL,
      {
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return "Connected";
  } catch (error) {
    return "Error";
  }
}
