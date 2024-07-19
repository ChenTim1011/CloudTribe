"use client";

import React from 'react';
import NavigationBar from "@/components/NavigationBar";
import { UserForm } from '@/components/register/UserForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="RegisterPage">
      <NavigationBar />
      <UserForm />
    </div>
  );
}

export default RegisterPage;
