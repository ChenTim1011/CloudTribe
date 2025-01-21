'use client';

import  React from 'react';
import { NavigationBar } from "@/components/NavigationBar";
import { UserForm } from '@/components/login/UserForm';


const LoginPage: React.FC = () => {
  return (
    <div
      className="flex flex-col h-screen items-center"
      style={{
        backgroundImage: "url('/mountain.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full">
        <NavigationBar />
      </div>
      <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded relative m-4 p-4" role="alert">
        <strong className="font-bold">提醒：</strong>
        <span className="block sm:inline">登入後可點擊上方功能列選擇欲前往的頁面</span>
      </div>
      <div className="w-full flex justify-start space-x-2 mt-4">
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white bg-opacity-75 lg:p-16 p-12 rounded-lg shadow-lg">
          <UserForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
