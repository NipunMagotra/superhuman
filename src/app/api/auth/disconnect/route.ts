import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plugin = searchParams.get('plugin'); // 'gmail' or 'googlecalendar'

    if (!plugin || (plugin !== 'gmail' && plugin !== 'googlecalendar')) {
      return NextResponse.json({ error: 'Invalid plugin' }, { status: 400 });
    }

    // Delete OAuth credentials from corsair_accounts table
    await pool.query(
      `DELETE FROM corsair_accounts 
       WHERE tenant_id = 'default' 
         AND integration_id = (SELECT id FROM corsair_integrations WHERE name = $1)`,
      [plugin]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to disconnect plugin:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
