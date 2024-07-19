'use client';

import React from 'react';
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
      
      <div className="w-full flex justify-start p-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          返回主頁
        </Button>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white bg-opacity-75 p-16 rounded-lg shadow-lg">
          <UserForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
