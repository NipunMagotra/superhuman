import { NextResponse } from 'next/server';
import { semanticSearchEmails } from '@/lib/embeddings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, threshold, count } = body;

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = await semanticSearchEmails(
      query,
      threshold !== undefined ? parseFloat(threshold) : 0.3,
      count !== undefined ? parseInt(count, 10) : 10
    );

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('Error in semantic search endpoint:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
