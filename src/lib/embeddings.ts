import { OpenAI } from 'openai';
import { supabaseServer } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === '') {
    // Return a zero-vector if text is empty
    return new Array(1536).fill(0);
  }

  // Pre-process: Clean up text and truncate to fit within model limits safely (roughly 8000 tokens max)
  // Quick estimation: 1 token ~ 4 characters. 8000 tokens ~ 32000 characters.
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  const truncatedText = cleanedText.slice(0, 32000);

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncatedText,
    encoding_format: 'float',
  });

  return response.data[0].embedding;
}

export async function cacheEmailWithEmbedding(email: {
  gmail_id: string;
  thread_id: string;
  from_address: string;
  from_name: string;
  to_addresses: any;
  subject: string;
  snippet: string;
  body_text: string;
  body_html: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  priority_score: number;
  received_at: string;
}) {
  // Combine fields for semantic context
  const textToEmbed = `
Subject: ${email.subject}
From: ${email.from_name} <${email.from_address}>
Snippet: ${email.snippet}
Body: ${email.body_text}
  `.trim();

  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(textToEmbed);
  } catch (err) {
    console.error(`Failed to generate embedding for email ${email.gmail_id}:`, err);
  }

  const { data, error } = await supabaseServer
    .from('cached_emails')
    .upsert(
      {
        gmail_id: email.gmail_id,
        thread_id: email.thread_id,
        from_address: email.from_address,
        from_name: email.from_name,
        to_addresses: email.to_addresses,
        subject: email.subject,
        snippet: email.snippet,
        body_text: email.body_text,
        body_html: email.body_html,
        labels: email.labels,
        is_read: email.is_read,
        is_starred: email.is_starred,
        priority_score: email.priority_score,
        received_at: email.received_at,
        embedding: embedding,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'gmail_id',
      }
    )
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function semanticSearchEmails(query: string, threshold = 0.3, count = 10) {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseServer.rpc('match_emails', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
  });

  if (error) {
    throw error;
  }

  return data || [];
}
