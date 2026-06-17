import { streamText, createUIMessageStreamResponse } from 'ai';
import { openai } from '@ai-sdk/openai';
import { buildCorsairToolDefs } from '@corsair-dev/mcp';
import { corsair } from '@/lib/corsair';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Check if the API key is missing or is the placeholder key
    const apiKey = process.env.OPENAI_API_KEY || '';
    const isMockKey = apiKey.startsWith('sk-live-e3d64c89') || apiKey === '' || apiKey.includes('YOUR_');

    if (isMockKey) {
      const messageId = 'msg-' + Date.now();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue({ type: 'start' });
          controller.enqueue({ type: 'text-start', id: messageId });
          
          const text = "Hello! I am your AI Command Assistant.\n\nSince the OpenAI API Key is not configured or is a placeholder, I am running in **mock demo mode**.\n\nYou can ask me to draft replies, list calendar events, or search your inbox. To activate full functional AI support, please configure a valid OpenAI API key in your `.env.local` file!\n\nHow can I help you today?";
          
          const chunks = text.match(/.{1,8}/g) || [text];
          for (const chunk of chunks) {
            controller.enqueue({ type: 'text-delta', id: messageId, delta: chunk });
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          
          controller.enqueue({ type: 'text-end', id: messageId });
          controller.enqueue({ type: 'finish', finishReason: 'stop' });
          controller.close();
        }
      });

      return createUIMessageStreamResponse({ stream });
    }

    const toolDefs = buildCorsairToolDefs({ corsair });

    const tools: Record<string, any> = {};
    for (const def of toolDefs) {
      if (def.name === 'corsair_setup' || def.name === 'request_permission') continue;

      tools[def.name] = {
        description: def.description,
        parameters: z.object(def.shape),
        execute: async (args: any) => {
          try {
            const res = await def.handler(args);
            const textContent = res.content
              .filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('\n');

            if (res.isError) {
              return { error: textContent };
            }

            try {
              return JSON.parse(textContent);
            } catch {
              return textContent;
            }
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
        },
      };
    }

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      system: `
You are the AI Command Center Agent, an assistant helping the user manage their Gmail and Google Calendar.
You have access to the Corsair SDK via the "run_script", "list_operations", and "get_schema" tools.

To interact with Gmail and Google Calendar, write Javascript snippets and run them using the "run_script" tool.
Always return the value from your scripts, e.g. "return await corsair.gmail.api.messages.list({ userId: 'me', maxResults: 5 })".

Here are some guidelines:
1. When asked to send or draft emails, you can construct and send MIME base64url messages, or search the schema first.
2. When managing events, write scripts to call calendar operations.
3. Be professional, direct, and efficient (keyboard-first Superhuman style).
4. Do not mention the details of the tools unless asked. Just execute commands and report the results.
      `.trim(),
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error('Error in AI chat route:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
