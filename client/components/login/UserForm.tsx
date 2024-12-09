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
        <span>註冊請加入 LINE 機器人</span>
      </Button>

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
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="請輸入電話號碼"
            />
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
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            登入
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserForm;
