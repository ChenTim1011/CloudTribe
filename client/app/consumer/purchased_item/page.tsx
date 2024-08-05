'use client'
import React, { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationBar } from "@/components/NavigationBar"
import { OrderedProductTable } from "@/components/consumer/OrderedProductTable"
import { ArrivedProductTable } from "@/components/consumer/ArrivedProductTable"
import { User } from '@/services/interface'
import { useRouter } from 'next/navigation'
import Link from "next/link"

export default function Page(){
 
  return(
    <div>
      <NavigationBar/> 
     
      <Tabs defaultValue="ordered">
        <TabsList className="w-full">
          <TabsTrigger value="ordered" className="w-1/2">待出貨商品</TabsTrigger>
          <TabsTrigger value="arrived" className="w-1/2">待收貨商品</TabsTrigger>
        </TabsList>
        <TabsContent value="ordered" className="justify-items-center text-center" >
          <OrderedProductTable/>
        </TabsContent>
        <TabsContent value="arrived" className="justify-items-center text-center">
          <ArrivedProductTable/>
        </TabsContent>    
      </Tabs>
    </div>
  )
}