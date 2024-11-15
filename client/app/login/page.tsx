'use client';

import React from 'react';
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
