# @hir3d/ai

A package providing AI helpers using Vercel's AI SDK with Google Gemini models.

## Setup

Make sure to set your Google AI API key:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

## Usage

### Basic Chat

```typescript
import { chat, fastModelName, deepModelName } from '@hir3d/ai';

const messages = [
  { role: 'user', content: 'Hello, how are you?' }
];

const result = await chat(messages, fastModelName);
console.log(result.text);
```

### Structured Output

```typescript
import { structuredOutput } from '@hir3d/ai';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()).max(5)
});

const result = await structuredOutput({
  schema,
  system: 'Extract metadata from the content',
  prompt: 'Analyze: A web app for 3D hiring processes',
  provider: 'google'
});

console.log(result.object);
```

## Available Models

- `fastModelName`: Gemini 2.0 Flash (fast, cost-effective)
- `deepModelName`: Gemini 1.5 Pro (more capable, slower)

## API

### `chat(messages, model?)`
Simple text chat with AI models.

### `structuredOutput(options)`
Generate structured data from prompts using Zod schemas.

### `model(modelName)`
Helper to create model instances.
