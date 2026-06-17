import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface EmailPriorityInput {
  subject: string;
  from_name: string;
  from_address: string;
  snippet: string;
}

export async function scorePriority(email: EmailPriorityInput): Promise<number> {
  try {
    const prompt = `
You are a priority classification engine for a professional's email client.
Analyze the email metadata below and assign a priority score between 0.0 and 1.0.
A score of 1.0 means extremely urgent or critical (requires immediate attention, e.g. active customer issues, important deal updates, calendar alerts, direct action items).
A score of 0.0 means low priority, spam, newsletters, or promotional updates.

Email details:
Sender Name: ${email.from_name}
Sender Email: ${email.from_address}
Subject: ${email.subject}
Snippet: ${email.snippet}

Assign a single score. Explain your logic briefly in 1 sentence, and end your response with: "SCORE: [0.0 - 1.0]". E.g. "SCORE: 0.85"
    `.trim();

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0,
    });

    const scoreMatch = text.match(/SCORE:\s*([0-9.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      const score = parseFloat(scoreMatch[1]);
      if (!isNaN(score)) {
        return Math.max(0, Math.min(1, score)); // clamp between 0 and 1
      }
    }

    return 0.5; // fallback default
  } catch (err) {
    console.error('Error scoring priority:', err);
    return 0.5; // fallback default
  }
}

export async function scorePriorityBatch(emails: EmailPriorityInput[]): Promise<number[]> {
  // Process in parallel with a concurrency limit if needed, or simply Promise.all for reasonable batches
  return await Promise.all(emails.map(email => scorePriority(email)));
}
