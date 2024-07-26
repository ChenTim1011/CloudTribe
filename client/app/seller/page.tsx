'use client'
import React, { useState } from "react"
import SellerDialog from "@/components/seller/SellerDialog"
import OnShelfTable from "@/components/seller/OnShelfTable"
import HistoryProductTable from "@/components/seller/HistoryProductTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavigationBar from "@/components/NavigationBar"


export default function Page(){
  return(
    <div>
      <NavigationBar /> 
      <Tabs defaultValue="on shelf">
        <TabsList className="w-full">
          <TabsTrigger value="on shelf" className="w-1/2">我的架上商品</TabsTrigger>
          <TabsTrigger value="history" className="w-1/2">我的歷史商品</TabsTrigger>
        </TabsList>
        <TabsContent value="on shelf" className="justify-items-center text-center">
          <OnShelfTable/>
          <SellerDialog/>
        </TabsContent>
        <TabsContent value="history" className="justify-items-center text-center">
          <HistoryProductTable/>
        </TabsContent>    
      </Tabs>
    </div>
  )
}