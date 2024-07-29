'use client';

import React, { useState, useEffect } from 'react';
import  UserService from '@/services/user/user'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, MenubarSeparator } from "@/components/ui/menubar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountain } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useAuth } from '@/components/lib/AuthProvider';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"


const NavigationBar = () => {
  const components=[
    {title:"購買農產品", href:"/buy_agri_produce"},
    {title:"上架農產品", href:"/seller"},
    {title:"購買生活用品", href:"/buyer"},
    {title:"司機專區", href:"/driver"},
    {title:"查看表單", href:"/viewform"},  
  ]

  const handleLogout = ()=>{
    UserService.emptyLocalStorageUser()
  }
  
  const { user, logout } = useAuth();
  console.log('NavigationBar user:', user); 

  const useRWD=()=>{
    const [device,setDevice]=useState("mobile");
  
    const handleRWD=()=>{
        if(window.innerWidth>768)
            setDevice("PC");
        else if (window.innerWidth>576)
            setDevice("tablet");
        else
            setDevice("mobile");
    }
  
    useEffect(()=>{ 
        window.addEventListener('resize',handleRWD);
        handleRWD();
        return(()=>{
            window.removeEventListener('resize',handleRWD);
        })
    },[]);
  
    return device;
  }
  const device = useRWD();
  if(device == "PC" || device == "tablet"){
    return (
      <Menubar className="px-4 py-2 justify-between bg-[#E0EBAF] text-black sticky top-0">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faMountain} className="text-white h-6 w-6" />
          <Link href="/" className="font-bold text-lg">順路經濟平台</Link>
        </div>
        <div className="flex flex-row space-x-12">
          {components.map((component) => (
            <MenubarMenu>
            <MenubarTrigger>
              <Link href={component.href}>{component.title}</Link>
            </MenubarTrigger>
          </MenubarMenu>
          ))}
          
        </div>
        <div className='flex flex-row'>
        <MenubarMenu>
            <MenubarTrigger>
              <Link href="/login">登入</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href="/login" onClick={handleLogout}>登出</Link>
            </MenubarTrigger>
          </MenubarMenu>
          
        </div>

    
        {/*<div className="flex items-center space-x-4">
          {user ? (
            <>
              <span>您好, {user.name}</span>
              <Button onClick={logout}>登出</Button>
            </>
          ) : (
            <Link href="/login">登入</Link>
          )}
        </div>*/}
      </Menubar>
    );
  }
  else{
    return(
      <Menubar className="px-2 py-2 bg-[#E0EBAF] text-black w-full ">
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={faMountain} className="text-white h-4 w-4" />
          <Link href="/" className="font-bold text-md">順路經濟平台</Link>
        </div>
        <NavigationMenu className='z-50'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-[#E0EBAF] w-36">頁面導覽</NavigationMenuTrigger>
              <NavigationMenuContent >
                <ul className="grid w-full gap-3 p-4">
                  {components.map((component) => (
                    <Link href={component.href}>{component.title}</Link>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className='flex flex-row'>
        <MenubarMenu>
            <MenubarTrigger>
              <Link href="/login">登入</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href="/login">登出</Link>
            </MenubarTrigger>
          </MenubarMenu>          
        </div>
      </Menubar>

    )
  }
};

export default NavigationBar;
