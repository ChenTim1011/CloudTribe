import type { NextApiRequest, NextApiResponse } from 'next';
import UserService from '@/services/user/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, state } = req.query;

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: process.env.NEXT_PUBLIC_LINE_CALLBACK_URL!,
                client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
                client_secret: process.env.LINE_CLIENT_SECRET!,
            }),
        });

        const tokenData = await tokenResponse.json();

        // Get user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profileData = await profileResponse.json();

        // Bind LINE account
        await UserService.bindLineAccount(parseInt(state as string), profileData.userId);

        // Redirect to success page
        res.redirect('/line-binding-success');
    } catch (error) {
        console.error('Error in LINE callback:', error);
        res.redirect('/line-binding-error');
    }
}