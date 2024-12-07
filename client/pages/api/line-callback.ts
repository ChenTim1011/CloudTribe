import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/services/user/user';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(new URL('/profile?error=invalid_request', req.url));
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.NEXT_PUBLIC_LINE_CALLBACK_URL!,
                client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
                client_secret: process.env.LINE_CLIENT_SECRET!,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(tokenData.error_description || 'Failed to get token');
        }

        // Get user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profileData = await profileResponse.json();
        if (!profileResponse.ok) {
            throw new Error('Failed to get profile');
        }

        // Bind LINE account
        await UserService.bindLineAccount(parseInt(state), profileData.userId);

        // Redirect to profile page with success message
        return NextResponse.redirect(new URL('/profile?success=true', req.url));
    } catch (error) {
        console.error('Error in LINE callback:', error);
        return NextResponse.redirect(new URL('/profile?error=binding_failed', req.url));
    }
}