/**
 * pollinations-client.js — Pollinations managed agents + text/image (BYOP).
 * Used by Towers: every office creates and runs its own Pollinations agent.
 * Requires a Pollinations API key from https://enter.pollinations.ai/keys
 */
(async function (root) {
    const CHAT_URL = "https://gen.pollinations.ai/v1/chat/completions";
    const IMAGE_URL = "https://gen.pollinations.ai/v1/images/generations";
    const AGENTS_URL = "https://gen.pollinations.ai/account/agents";
    const CHAT_MODEL = "deepseek/deepseek-v4-flash";
    const IMAGE_MODEL = "flux";

    function authHeaders(apiKey) {
        if (!apiKey) throw new Error("Missing Pollinations API key — get one at enter.pollinations.ai/keys");
        return { "Content-Type": "application/json", Authorization: "Bearer " + apiKey };
    }

    root.PolliClient = {
        /** Create a managed prompt agent for a company. Returns the agent object (includes `model`). */
        async createAgent({ apiKey, name, title, systemPrompt, description = "", baseModel = CHAT_MODEL }) {
            const res = await fetch(AGENTS_URL, {
                method: "POST",
                headers: authHeaders(apiKey),
                body: JSON.stringify({ name, title, description, systemPrompt, baseModel }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_e) {}
                throw new Error("Agent creation error " + res.status + " " + detail);
            }
            return res.json();
        },

        /** Invoke a managed agent through its callable model. Runs on the caller's Pollen. */
        async runAgent({ apiKey, agent, prompt, maxTokens = 220 }) {
            if (!agent?.model) throw new Error("Agent has no model — create it first with createAgent()");
            return this.chatCompletion(prompt, { apiKey, model: agent.model, maxTokens });
        },

        async chatCompletion(prompt, { apiKey, model = CHAT_MODEL, maxTokens = 200 } = {}) {
            const res = await fetch(CHAT_URL, {
                method: "POST",
                headers: authHeaders(apiKey),
                body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: maxTokens }),
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
            const res = await fetch(IMAGE_URL, {
                method: "POST",
                headers: authHeaders(apiKey),
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

    if (typeof module === "object" && module.exports) module.exports = root.PolliClient;
})(typeof self !== "undefined" ? self : globalThis);
