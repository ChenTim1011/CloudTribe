"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    console.log("Starting handleSave");

    // clear error and success messages
    setErrorMessage('');
    setSuccessMessage('');

    // check if name and phone are empty
    const namePattern = /^[\u4e00-\u9fa5A-Za-z]+$/;
    if (!namePattern.test(name)) {
      setErrorMessage('姓名只能包含英文和中文字');
      return;
    }

    // check if phone is empty
    const phonePattern = /^\d{7,10}$/;
    if (!phonePattern.test(phone)) {
      setErrorMessage('電話號碼必須是 7 到 10 個數字');
      return;
    }

    try {
      console.log("Creating new user with name and phone:", name, phone);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
        setSuccessMessage('註冊成功');
      } else if (response.status === 409) {
        setErrorMessage('電話號碼已經存在');
      } else {
        throw new Error('註冊過程中出現錯誤，或是電話號碼已經有人註冊過');
      }
    } catch (error) {
      console.error("Error during handleSave:", error);
      setErrorMessage('註冊過程中出現錯誤，或是電話號碼已經有人註冊過');
    }
  };

  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>首次使用</CardTitle>
            <CardDescription>
              在這裡輸入姓名和電話號碼完成後點擊註冊。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">電話</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {errorMessage && (
              <Alert className="bg-red-500 text-white">
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="bg-green-500 text-white">
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>註冊</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default UserForm;
