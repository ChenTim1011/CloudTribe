import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/lib/AuthProvider';
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

  // UseEffect to check localStorage
  useEffect(() => {
    // Check if it is client side
    if (typeof window !== 'undefined') {   // From localStorage to get the last phone number
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

    // Clear error and success messages
    setErrorMessage('');
    setSuccessMessage('');

    // Check if name and phone are valid
    const namePattern = /^[\u4e00-\u9fa5A-Za-z]+$/;
    if (!namePattern.test(name)) {
      setErrorMessage('姓名只能包含英文和中文字');
      return;
    }

    // Check if phone is valid
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
 

    // store the phone number in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastPhone', phone);
    }
  };

  const handleAddLineBot = () => {
    window.open('https://line.me/R/ti/p/%40211mdhui', '_blank');
  };

  return (

    <div className="flex flex-col items-center space-y-4">
      <Button 
        onClick={handleAddLineBot}
        className="w-full max-w-[400px] bg-[#00B900] hover:bg-[#009900] text-white flex items-center justify-center space-x-2"
      >
        <span>加入 LINE 機器人</span>
      </Button>

    <Tabs defaultValue="login" className="lg:w-full max-w-[400px]">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2"> 
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
        <Card className="w-full max-w-[400px] min-h-[350px]"> 
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
    </div>
  );
}

export default UserForm;
