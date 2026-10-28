/**
 * pollinations-client.js — Pollinations LLM + image generation (BYOP).
 * Used by polli-haiku to write haiku (chat) and illustrate them (image).
 *
 * Requires a Pollinations API key from https://enter.pollinations.ai/keys
 * (create one, then paste it into the app — stored locally in the browser).
 */
(async function (root) {
    const CHAT_URL = "https://gen.pollinations.ai/v1/chat/completions";
    const IMAGE_URL = "https://gen.pollinations.ai/v1/images/generations";
    const CHAT_MODEL = "deepseek/deepseek-v4-flash";
    const IMAGE_MODEL = "flux";

    root.PolliClient = {
        async chatCompletion(prompt, { apiKey, model = CHAT_MODEL, maxTokens = 200 } = {}) {
            if (!apiKey) throw new Error("Missing Pollinations API key — get one at enter.pollinations.ai/keys");
            const res = await fetch(CHAT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: maxTokens,
                }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_e) {}
                throw new Error("Pollinations LLM error " + res.status + " " + detail);
            }
            const data = await res.json();
            return (data.choices?.[0]?.message?.content || "").trim();
        },

        async generateImage(prompt, { apiKey, model = IMAGE_MODEL, width = 512, height = 512 } = {}) {
            if (!apiKey) throw new Error("Missing Pollinations API key — get one at enter.pollinations.ai/keys");
            const res = await fetch(IMAGE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
                body: JSON.stringify({ model, prompt: String(prompt).slice(0, 1000), width, height }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_e) {}
                throw new Error("Pollinations image error " + res.status + " " + detail);
            }
            return res.blob();
        },
    };

    if (typeof module === "object" && module.exports) {
        module.exports = root.PolliClient;
    }
})(typeof self !== "undefined" ? self : globalThis);
