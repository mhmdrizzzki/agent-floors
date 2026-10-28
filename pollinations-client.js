/**
 * pollinations-client.js — Towers on Pollinations managed agents (BYOP).
 *
 * Agent lifecycle: the building's agents are published by the tower owner (a
 * visitor's scoped BYOP key cannot create agents — POST /account/agents needs
 * account:keys). Visitors only *run* agents, which their BYOP key can do.
 */
(async function (root) {
    const CHAT_URL = "https://gen.pollinations.ai/v1/chat/completions";
    const AGENTS_URL = "https://gen.pollinations.ai/account/agents";
    const CHAT_MODEL = "deepseek/deepseek-v4-flash";

    function authHeaders(apiKey) {
        if (!apiKey) throw new Error("Not connected — approve a key with the Pollinations Connect button first");
        return { "Content-Type": "application/json", Authorization: "Bearer " + apiKey };
    }

    root.PolliClient = {
        /** Callable model name for one of the building's agents. */
        agentModel(owner, slug) {
            return "community/" + owner + "/" + slug;
        },

        /** Run an agent shift. Works with a visitor's scoped BYOP key. */
        async runAgent({ apiKey, owner, slug, prompt, maxTokens = 220 }) {
            const res = await fetch(CHAT_URL, {
                method: "POST",
                headers: authHeaders(apiKey),
                body: JSON.stringify({
                    model: this.agentModel(owner, slug),
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: maxTokens,
                }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_e) {}
                throw new Error("Agent run error " + res.status + " " + detail);
            }
            const data = await res.json();
            return (data.choices?.[0]?.message?.content || "").trim();
        },

        /** Owner-only: create a managed prompt agent for a floor (needs account:keys). */
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
            return ((await res.json()).choices?.[0]?.message?.content || "").trim();
        },
    };

    if (typeof module === "object" && module.exports) module.exports = root.PolliClient;
})(typeof self !== "undefined" ? self : globalThis);
