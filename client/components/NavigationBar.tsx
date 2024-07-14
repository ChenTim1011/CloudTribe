

import React from 'react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, MenubarSeparator } from "@/components/ui/menubar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountain } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const NavigationBar = () => {
  return (
    <Menubar className="px-4 py-2 flex items-center" style={{ backgroundColor: '#E0EBAF', color: '#000000' }}>
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faMountain} className="text-white h-6 w-6" />
        <span className="font-bold text-lg">順路經濟平台</span>
      </div>
      <div className="flex space-x-4">
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/buy_agri_produce">農產品專區</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/buyer">部落居民專區</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/driver">司機專區</Link>
          </MenubarTrigger>
        </MenubarMenu>
      </div>
    </Menubar>
  );
};

export default NavigationBar;
