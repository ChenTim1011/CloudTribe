'use client';

import React from 'react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, MenubarSeparator } from "@/components/ui/menubar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountain } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useAuth } from '@/components/lib/AuthProvider';

const NavigationBar = () => {
  const { user, logout } = useAuth();

  console.log('NavigationBar user:', user); 

  return (
    <Menubar className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: '#E0EBAF', color: '#000000' }}>
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faMountain} className="text-white h-6 w-6" />
        <Link href="/" className="font-bold text-lg">順路經濟平台</Link>
      </div>
      <div className="flex-grow flex space-x-6 justify-center">
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/buy_agri_produce">購買農產品</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/seller">上架農產品</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/buyer">購買生活用品</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/driver">司機專區</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/viewform">查看表單</Link>
          </MenubarTrigger>
        </MenubarMenu>
        
      </div>

    
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span>您好, {user.name}</span>
            <Button onClick={logout}>登出</Button>
          </>
        ) : (
          <Link href="/login">登入</Link>
        )}
      </div>
    </Menubar>
  );
};

export default NavigationBar;
