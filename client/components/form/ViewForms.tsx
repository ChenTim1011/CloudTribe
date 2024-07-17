import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormOrderCard from './FormOrderCard';  
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const ViewForms: React.FC = () => {
    const [role, setRole] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    const handleFetchOrders = async () => {
        if (!role || !phone) {
            setError('請選擇角色並輸入電話號碼');
            return;
        }
        setError('');
        try {
            const response = await fetch(`/api/form?role=${role}&phone=${phone}`);
            if (!response.ok) {
                throw new Error('獲取訂單失敗');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">查看表單</h1>
            <div className="mb-4">
                <Select onValueChange={setRole} value={role}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇角色" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="seller">賣家</SelectItem>
                        <SelectItem value="buyer">買家</SelectItem>
                        <SelectItem value="driver">司機</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mb-4">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話號碼" />
            </div>
            <Button className="bg-black text-white" onClick={handleFetchOrders}>查看表單</Button>
            {error && (
                <div className="text-red-600 mt-2">{error}</div>
            )}
            <div className="mt-4">
                {orders.map(order => (
                    <FormOrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => {}}
                        onTransfer={() => {}}
                        onNavigate={() => {}}
                    />
                ))}
            </div>
        </div>
    );
};

export default ViewForms;
