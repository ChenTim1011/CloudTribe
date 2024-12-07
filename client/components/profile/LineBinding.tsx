'use client'
import React, { useEffect } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSearchParams } from 'next/navigation';

export function LineBinding() {
    const { user } = useAuth();
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check URL parameters for success or error messages
        if (searchParams.get('success') === 'true') {
            setSuccess('LINE 帳號綁定成功！');
        } else if (searchParams.get('error')) {
            setError('綁定 LINE 帳號失敗，請稍後再試');
        }
    }, [searchParams]);

    const handleLineLogin = () => {
        const lineLoginUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
        const callbackUrl = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || 
                           `${window.location.origin}/api/line-callback`;

        lineLoginUrl.searchParams.append('response_type', 'code');
        lineLoginUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_LINE_CLIENT_ID!);
        lineLoginUrl.searchParams.append('redirect_uri', callbackUrl);
        lineLoginUrl.searchParams.append('state', user?.id?.toString() || '');
        lineLoginUrl.searchParams.append('scope', 'profile');

        window.location.href = lineLoginUrl.toString();
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">綁定 LINE 帳號</h2>
            <p className="mb-4">將您的帳號與 LINE 綁定，以接收即時通知。</p>
            
            <div className="space-y-4">
                <Button 
                    onClick={handleLineLogin}
                    className="bg-[#00B900] hover:bg-[#009900] text-white"
                >
                    綁定 LINE 帳號
                </Button>

                {error && (
                    <Alert className="bg-red-500 text-white">
                        <AlertTitle>錯誤</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="bg-green-500 text-white">
                        <AlertTitle>成功</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}