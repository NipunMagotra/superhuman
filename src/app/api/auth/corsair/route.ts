import { NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';
import { generateOAuthUrl, processOAuthCallback } from 'corsair/oauth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const plugin = searchParams.get('plugin'); // e.g. 'gmail' or 'googlecalendar'

    const requestUrl = new URL(request.url);
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    const appUrl = envUrl || requestUrl.origin;
    const redirectUri = `${appUrl}/api/auth/corsair`;

    // 1. Handle OAuth Callback
    if (code && state) {
      const result = await processOAuthCallback(corsair, {
        code,
        state,
        redirectUri,
      });

      console.log(`OAuth Callback successful for plugin: ${result.plugin}, tenant: ${result.tenantId}`);

      // Redirect back to connection status page in front-end
      return NextResponse.redirect(`${appUrl}/auth?success=true&plugin=${result.plugin}`);
    }

    // 2. Initiate OAuth flow
    if (plugin) {
      if (plugin !== 'gmail' && plugin !== 'googlecalendar') {
        return NextResponse.json({ error: 'Invalid plugin. Must be gmail or googlecalendar' }, { status: 400 });
      }

      const oauthResult = await generateOAuthUrl(corsair, plugin, {
        tenantId: 'default', // single tenant default
        redirectUri,
      });

      // Redirect user to Google consent screen
      return NextResponse.redirect(oauthResult.url);
    }

    return NextResponse.json({ error: 'Missing code/state or plugin parameter' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in OAuth route:', err);
    // Redirect to auth error page
    const requestUrl = new URL(request.url);
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    const appUrl = envUrl || requestUrl.origin;
    return NextResponse.redirect(`${appUrl}/auth?error=${encodeURIComponent(err.message || String(err))}`);
  }
}
