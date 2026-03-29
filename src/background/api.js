/**
 * OpenAI API integration and comment generation.
 */

import { getStorage } from "../shared/storage.js";
import { buildPrompt, SYSTEM_PROMPT } from "../../prompts/index.js";
import { appendHistory } from "./history.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const SETTINGS_KEYS = ["openaiApiKey", "myVoiceProfile", "defaultMode"];

export async function getSettings() {
    const settings = await getStorage(SETTINGS_KEYS);
    return {
        openaiApiKey: settings.openaiApiKey || "",
        myVoiceProfile: settings.myVoiceProfile || "",
        defaultMode: settings.defaultMode || "Builder"
    };
}

function extractOutputText(responseJson) {
    const content =
        responseJson?.choices?.[0]?.message?.content ||
        responseJson?.output_text ||
        "";
    return content.trim();
}

export async function generateComment(requestPayload) {
    const settings = await getSettings();
    if (!settings.openaiApiKey) {
        throw new Error("Missing OpenAI API key. Set it in Settings.");
    }

    const promptPayload = {
        ...requestPayload,
        my_voice_profile: settings.myVoiceProfile || ""
    };

    const body = {
        model: "gpt-4.1-mini",
        temperature: 0.7,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: buildPrompt(promptPayload)
            }
        ]
    };

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let detail = "OpenAI request failed.";
        try {
            const errJson = await response.json();
            detail = errJson?.error?.message || detail;
        } catch (_e) {
            detail = `${detail} HTTP ${response.status}`;
        }
        throw new Error(detail);
    }

    const responseJson = await response.json();
    const generatedComment = extractOutputText(responseJson);

    if (!generatedComment) {
        throw new Error("Model returned an empty response.");
    }

    const historyRecord = {
        platform: requestPayload.platform || "unknown",
        url: requestPayload.url || "",
        author_name: requestPayload.author_name || "Unknown",
        post_snippet: (requestPayload.post_text || "").slice(0, 400),
        comment_snippets: (requestPayload.comments || []).slice(0, 10).map((text) => text.slice(0, 220)),
        generated_comment: generatedComment,
        mode: requestPayload.mode || "Builder",
        extra_context: requestPayload.extra_context || "",
        timestamp: new Date().toISOString()
    };

    await appendHistory(historyRecord);

    return { generatedComment, historyRecord };
}
