'use client'
import React, { useState, useEffect } from "react"
import SellerDialog from "@/components/tribe_resident/seller/SellerDialog"
import OnShelfTable from "@/components/tribe_resident/seller/OnShelfTable"
import HistoryProductTable from "@/components/tribe_resident/seller/HistoryProductTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavigationBar from "@/components/NavigationBar"
import UseService from "@/services/user/user"
import SellerService from "@/services/seller/seller"
import { User, BasicProductInfo } from '@/services/interface'
import { useRouter } from 'next/navigation'

export default function Page(){
  const [user, setUser] = useState<User>()
  const [products, setProducts] = useState<BasicProductInfo[]>([])
  const router = useRouter()
  const today = new Date()
  
  useEffect(() => {
    const _user = UseService.getLocalStorageUser()
    setUser(_user)
    if(_user.name == 'empty'){
      router.replace('/login')
    }   
    get_products(_user)
  }, [])

  const get_products = async(user:User) => {
    if(user != undefined){
      const res_products = await SellerService.get_upload_product(user.id)
      var _products: BasicProductInfo[] = res_products
      setProducts(_products)
    }
      
  }

  return(
    <div>
      <NavigationBar/> 
      <Tabs defaultValue="on shelf">
        <TabsList className="w-full">
          <TabsTrigger value="on shelf" className="w-1/2">我的架上商品</TabsTrigger>
          <TabsTrigger value="history" className="w-1/2">我的歷史商品</TabsTrigger>
        </TabsList>
        <TabsContent value="on shelf" className="justify-items-center text-center" >
          <OnShelfTable products={products.filter((product) => product.offShelfDate >= today.toISOString().split('T')[0])}/>
          <SellerDialog/>
        </TabsContent>
        <TabsContent value="history" className="justify-items-center text-center">
          <HistoryProductTable products={products.filter((product) => product.offShelfDate < today.toISOString().split('T')[0])}/>
        </TabsContent>    
      </Tabs>
    </div>
  )
}