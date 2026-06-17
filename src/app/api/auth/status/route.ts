import { NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';

export async function GET() {
  try {
    const status = await corsair.manage.connectionStatus.get({ tenantId: 'default' });
    return NextResponse.json(status);
  } catch (err) {
    console.error('Failed to get connection status:', err);
    return NextResponse.json({
      gmail: 'not_connected',
      googlecalendar: 'not_connected',
    });
  }
}
