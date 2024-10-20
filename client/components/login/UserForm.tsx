import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/lib/AuthProvider';
import  { User }  from '@/services/interface'
import UserService from '@/services/user/user'

/**
 * UserForm component for registering and logging in users.
 */
export function UserForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { setUser } = useAuth();

  // 使用 useEffect 來安全地存取 localStorage
  useEffect(() => {
    // 檢查是否在客戶端環境
    if (typeof window !== 'undefined') {
      // 從 localStorage 讀取上次登錄的電話號碼
      const lastPhone = localStorage.getItem('lastPhone');
      if (lastPhone) {
        setPhone(lastPhone);
      }
    }
  }, []);

  /**
   * Handles the registration process when the user clicks the "註冊" button.
   */
  const handleRegister = async () => {
    console.log("Starting handleRegister");

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

    try{
      const res_register = await UserService.register(name, phone, 'default_location', false)
      if(res_register == "phone exists")
        setErrorMessage('電話號碼已經存在')
      else
        setSuccessMessage('註冊成功')
    }
    catch(e){
      setErrorMessage('註冊過程中出現錯誤')
      console.log(e)
    }
    //The below code is origin code of register
    /*
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
        console.log("Setting user:", data);
        setUser({ id: data.id, name: data.name, phone: data.phone, location:data.location });
        setSuccessMessage('註冊成功');
      } else if (response.status === 409) {
        setErrorMessage('電話號碼已經存在');
      } else {
        throw new Error('註冊過程中出現錯誤');
      }
    } catch (error) {
      console.error("Error during handleRegister:", error);
      setErrorMessage('註冊過程中出現錯誤');
    }*/
  };

  /**
   * Handles the login process when the user clicks the "登入" button.
   */
  const handleLogin = async () => {
    // clear error and success messages
    setErrorMessage('');
    setSuccessMessage('');
    try{
      const res_login = await UserService.login(phone)
      if(res_login == "user not found")
        setErrorMessage('電話輸入錯誤')
      else {
        setUser(res_login)
        localStorage.setItem('@user', JSON.stringify(res_login))
        setSuccessMessage('登入成功')
      }  
    }
    catch(e){
      setErrorMessage('登入過程中出現錯誤');
      console.log(e)
    }
    //The below code is origin code of login
/*
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Setting user:", data);
        setUser({ id: data.id, name: data.name, phone: data.phone, location:data.location });
        //add
        const userData: User = { id: data.id, name: data.name, phone: data.phone, location: data.location };
        try {
          localStorage.setItem('@user', JSON.stringify(userData));
        } catch (e) {
          console.log(e)
        }
        

        setSuccessMessage('登入成功');
      } else {
        throw new Error('登入過程中出現錯誤');
      }
    } catch (error) {
      console.error("Error during handleLogin:", error);
      setErrorMessage('登入過程中出現錯誤');
    }*/

    // 登錄成功後，保存電話號碼到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastPhone', phone);
    }
  };

  return (
    <Tabs defaultValue="login" className="lg:w-full max-w-[400px]">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        {/* 設置統一的樣式，並確保兩個按鈕大小一致 */}
        <TabsTrigger
          value="register"
          className="w-full py-2 text-center border-b-2 border-transparent hover:border-black focus:border-black"
        >
          註冊
        </TabsTrigger>
        <TabsTrigger
          value="login"
          className="w-full py-2 text-center border-b-2 border-transparent hover:border-black focus:border-black"
        >
          登入
        </TabsTrigger>
      </TabsList>
      <TabsContent value="register">
        <Card className="w-full max-w-[400px] min-h-[350px]"> {/* 設置固定寬度 */}
          <CardHeader>
            <CardTitle>註冊</CardTitle>
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
            <Button onClick={handleRegister}>註冊</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="login">
        <Card className="w-full max-w-[400px] min-h-[350px]"> {/* 設置固定寬度 */}
          <CardHeader>
            <CardTitle>登入</CardTitle>
            <CardDescription>
              請輸入您的電話號碼登入。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
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
            <Button onClick={handleLogin}>登入</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default UserForm;
