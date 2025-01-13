'use client';

import React, { useState, useEffect } from 'react'; 
import UserService from '@/services/user/user';
import { User } from '@/interfaces/user/user';
import { Menubar, MenubarMenu, MenubarTrigger} from "@/components/ui/menubar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountain, faGear } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

/**
 * Interface for the authentication component props.
 * @param userInfo - The user information to determine if the user is logged in or not.
 */
interface authProps {
  userInfo: User | undefined;
}

/**
 * Component for handling user authentication actions like login and logout.
 * @param prop - The properties containing user information.
 * @returns JSX.Element - The AuthComponent rendering the login/logout button and settings link.
 */
const AuthComponent: React.FC<authProps> = (prop) => {
  return (
    <div className='flex flex-row items-center'>
      {/* If the user is not logged in, show the login link */}
      {prop.userInfo?.id == 0 &&
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/login">登入</Link>
          </MenubarTrigger>
        </MenubarMenu>
      }
      {/* If the user is logged in, show the logout link */}
      {prop.userInfo?.id != 0 &&
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/login" onClick={() => UserService.emptyLocalStorageUser()}>登出</Link>
          </MenubarTrigger>
        </MenubarMenu>
      }
      {/* If the user is logged in, show the settings icon */}
      {prop.userInfo?.id != 0 &&
        <Link href='/setting'><FontAwesomeIcon icon={faGear} /></Link>
      }
    </div>
  );
};

/**
 * NavigationBar component for rendering the navigation menu and user authentication options.
 * It adjusts based on the screen size using responsive design.
 */
export const NavigationBar = () => {
  // Array of navigation links for different sections
  const components = [
    { title: "註冊與登入", href : "/login" },
    { title: "回到主頁面", href : "/" },
    { title: "購買農產品", href: "/consumer" },
    { title: "上架農產品", href: "/tribe_resident/seller" },
    { title: "購買生活用品", href: "/tribe_resident/buyer" },
    { title: "司機專區", href: "/driver" },
  ];

  // State for storing user information
  const [user, setUser] = useState<User>();

  /**
   * Custom hook for detecting the device type (mobile, tablet, or PC).
   * @returns {string} - The device type.
   */
  const useRWD = () => {
    const [device, setDevice] = useState("mobile");

    /**
     * Function to handle window resizing and determine the device type.
     */
    const handleRWD = () => {
      if (window.innerWidth > 768) {
        setDevice("PC");
      } else if (window.innerWidth > 576) {
        setDevice("tablet");
      } else {
        setDevice("mobile");
      }
    };

    // Effect to set up the event listener for window resizing
    useEffect(() => { 
      const _user = UserService.getLocalStorageUser();
      setUser(_user);

      window.addEventListener('resize', handleRWD);
      handleRWD(); // Initial call to set the device type
      return () => {
        window.removeEventListener('resize', handleRWD);
      };
    }, []);

    return device;
  };

  // Determine the device type using the custom hook
  const device = useRWD();

  // Render the navigation bar for PC or tablet
  if (device == "PC" || device == "tablet") {
    return (
      <Menubar className="px-2 py-2 justify-between bg-[#E0EBAF] text-black w-full text-sm">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faMountain} className="text-black h-6 w-6" />
          <Link href="/" className="font-bold text-lg">順路經濟平台</Link>
        </div>
        <div className="flex flex-row space-x-12">
          {/* Render each navigation link */}
          {components.map((component) => (
            <MenubarMenu key={component.title}>
              <MenubarTrigger>
                <Link href={component.href}>{component.title}</Link>
              </MenubarTrigger>
            </MenubarMenu>
          ))}
        </div>
        {/* Render the authentication component */}
        <AuthComponent userInfo={user} />
      </Menubar>
    );
  } else {
    // Render the navigation bar for mobile
    return (
      <Menubar className="px-2 py-2 justify-between bg-[#E0EBAF] text-black w-full">
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={faMountain} className="text-white h-4 w-4" />
          <Link href="/" className="font-bold text-md">順路經濟平台</Link>
        </div>
        <NavigationMenu className='z-50'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-[#E0EBAF] w-36">頁面導覽</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-full gap-3 p-4">
                  {/* Render each navigation link for mobile */}
                  {components.map((component) => (
                    <Link key={component.title} href={component.href} onClick={() => { window.location.href = `${component.href}` }}>
                      {component.title}
                    </Link>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {/* Render the authentication component */}
        <AuthComponent userInfo={user} />
      </Menubar>
    );
  }
};
