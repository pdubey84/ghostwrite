/**
 * Prompt builder for OpenAI chat completions.
 */

export function buildPrompt(payload) {
    const commentsText = (payload.comments || []).length
        ? payload.comments.map((c, i) => `${i + 1}. ${c}`).join("\n")
        : "No visible comments extracted.";

    return [
        `Platform: ${payload.platform || "unknown"}`,
        `Page URL: ${payload.url || ""}`,
        `Post author: ${payload.author_name || "Unknown"}`,
        "What they said:",
        payload.post_text || "",
        "What others are saying:",
        commentsText,
        "Extra context:",
        payload.extra_context || "None",
        "My Voice profile:",
        payload.my_voice_profile || "",
        `Thought leadership mode: ${payload.mode || "Builder"}`,
        "",
        "Write a real comment:",
        "- Pick 1-2 things that actually stood out to you",
        "- If people commented, respond to someone's point directly",
        "- Add one thing nobody else mentioned yet",
        "- End with a real question or observation",
        "- Keep it to 40-90 words - be concise",
        "- No emojis, hashtags, or em dashes (—)",
        "- Never say 'Great post' or generic praise",
        "- Sound like you're actually talking to people",
        "- Return only the comment"
    ].join("\n");
}
