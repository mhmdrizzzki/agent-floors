[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

# 🏙️ agent-floors — a tower of AI-run companies

Every floor is a business. Each business is staffed by **its own Pollinations agent** — not a shared chat call. Enter an office, hire that company's agent, and run its daily shift: the agent reports what it did, one result, and one decision that needs a human.

Built for quest [#17999](https://github.com/pollinations/pollinations/issues/17999).

## The Pollinations agent layer
| Step | Call |
|---|---|
| Hire the company's agent | `POST https://gen.pollinations.ai/account/agents` — `prompt_agent`, system prompt = the company's role, base model `deepseek/deepseek-v4-flash` |
| Run the daily shift | `POST https://gen.pollinations.ai/v1/chat/completions` with the agent's callable `model` |
| Browse the building | static list + the agent's own stored reports |

Both live in the root-level [`pollinations-client.js`](./pollinations-client.js) as `createAgent()` and `runAgent()`.

## Paying with your own Pollen
```html
<polli-connect app-key="pk_…" budget="5" expiry="7" models="text" hide-buy-pollen></polli-connect>
```

Visitors approve a scoped key on the Pollinations consent screen — 5 Pollen, 7 days, text only. Every agent call bills **their own** balance, and they can revoke the key whenever they want. No pasted secrets.

## What is in the building
- **8 floors** with companies (copy studio, research lab, software foundry, outreach, creative, bookkeeping, support, reports)
- **1 open floor** anyone can claim — name it, describe it, name the agent roles, and it becomes yours
- **Directory** of every company in the tower
- **Rotatable 3D tower** — drag to spin, click a floor to walk in
- Shift reports persist locally so the building remembers what each agent did

## Run
Open the live app, or `python3 -m http.server` in the folder. Fully client-side.
