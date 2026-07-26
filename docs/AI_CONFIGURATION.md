# AI Configuration Guide

AfroStore uses multiple AI providers with automatic failover. If one provider fails or hits rate limits, the system switches to the next one seamlessly.

## Provider Setup

Set at least one API key in your environment variables. More providers = better reliability.

### Priority Order (fastest → most capable)

| Priority | Provider | Env Var | Free Tier | Best For |
|----------|----------|---------|-----------|----------|
| 1 | Groq | `GROQ_API_KEY` | Yes (generous) | Fast responses, chat |
| 2 | Groq (backup keys) | `GROQ_KEY_2`, `GROQ_KEY_3`, `GROQ_KEY_4` | Yes | Rate limit failover |
| 3 | Google AI | `GOOGLE_AI_KEY` | Yes | General purpose |
| 4 | OpenAI | `OPENAI_API_KEY` | No | High quality, vision |
| 5 | Anthropic | `ANTHROPIC_API_KEY` | No | Complex reasoning |
| 6 | DeepSeek | `DEEPSEEK_API_KEY` | Cheap | Budget fallback |

### Getting API Keys

- **Groq**: [console.groq.com](https://console.groq.com) → API Keys → Create
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) → API Keys
- **Google AI**: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com)

### Recommended Setup

For production, set at least 2 providers:

```env
# Primary — fast and free
GROQ_API_KEY="gsk_..."

# Backup — paid but reliable
OPENAI_API_KEY="sk-..."
```

For maximum reliability, add multiple Groq keys (each has its own rate limit):

```env
GROQ_API_KEY="gsk_key1..."
GROQ_KEY_2="gsk_key2..."
GROQ_KEY_3="gsk_key3..."
```

## How Failover Works

```
Request → Groq (primary)
            ↓ fails/rate limited
          Groq Key 2
            ↓ fails
          Google AI
            ↓ fails
          OpenAI
            ↓ fails
          Anthropic
            ↓ fails
          DeepSeek (last resort)
```

### Circuit Breaker

Each provider has a circuit breaker:
- **3 consecutive failures** → circuit opens (provider skipped for 30s)
- After 30s → circuit half-opens (one test request)
- If test succeeds → circuit closes (provider back in rotation)

### Rate Limit Handling

- HTTP 429 responses trigger immediate failover to next provider
- The rate-limited provider's circuit breaker opens
- Multiple Groq keys help distribute rate limits

## AI Features

### Chat Assistant (`/api/sites/:siteId/ai`)
- RAG-powered store assistant for merchants
- Knows store context (products, orders, customers)
- Supports image analysis (up to 4 images)
- 10-message conversation history

### Content Generation
- **Product descriptions**: `/api/sites/:siteId/ai/generate-product-description`
- **Page content**: `/api/sites/:siteId/ai/generate-page`
- **SEO metadata**: `/api/sites/:siteId/ai/generate-seo`
- **Theme/branding**: `/api/sites/:siteId/ai/generate-theme`
- **Sales funnels**: `/api/sites/:siteId/ai/generate-funnel`
- **Business copy**: `/api/sites/:siteId/ai/generate-business`
- **Full store**: `/api/sites/:siteId/ai/generate-store`

### AI Store Builder (`/api/stores/:id/ai-build`)
- Generates complete store from business description
- Picks template, creates pages, generates content

## Models Used

| Provider | Model | Context | Notes |
|----------|-------|---------|-------|
| Groq | llama-3.3-70b-versatile | 128K | Fast, free tier |
| OpenAI | gpt-4o | 128K | High quality, vision |
| OpenAI (fallback) | gpt-4o-mini | 128K | Cheaper |
| Anthropic | claude-3-5-sonnet | 200K | Best reasoning |
| Anthropic (fallback) | claude-3-haiku | 200K | Fast, cheap |
| DeepSeek | deepseek-chat | 64K | Budget option |

## Cost Tracking

The failover engine tracks costs per provider in-memory:
- Input/output tokens counted per request
- Cost estimated using per-model pricing
- Available via `getAIStatus()` and `getTotalCost()` in `ai-service.ts`

Note: Tracking resets on restart. Not persisted to database.

## Debugging

Check provider status in the admin or via API:

```typescript
import { getAIStatus } from "@/lib/ai-service";

const status = getAIStatus();
// Returns: { available, providers: { groq: { health, circuitState, usage }, ... }, cost }
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "No AI providers configured" | No API keys set | Add at least one key to env vars |
| Slow responses | Primary provider rate limited | Add more Groq keys or backup providers |
| Inconsistent quality | Falling back to weaker models | Ensure OpenAI or Anthropic key is set |
| All providers failing | Keys expired or invalid | Check and rotate API keys |
