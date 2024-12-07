'use client'
import { LineBinding } from '@/components/profile/LineBinding';
import { useAuth } from '@/components/lib/AuthProvider';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">用戶檔案</h1>
            <div className="grid gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">個人資訊</h2>
                    <p>姓名: {user?.name}</p>
                    <p>電話: {user?.phone}</p>
                </div>
                <LineBinding />
            </div>
        </div>
    );
}