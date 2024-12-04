'use client'
import React, { useState, useEffect } from "react"
import { SellerDialog } from "@/components/tribe_resident/seller/SellerDialog"
import { ProductTable } from "@/components/tribe_resident/seller/ProductTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationBar } from "@/components/NavigationBar"
import UseService from "@/services/user/user"
import SellerService from "@/services/seller/seller"
import DriverService from "@/services/driver/driver"
import { User } from '@/interfaces/user/user';
import { BasicProductInfo } from '@/interfaces/tribe_resident/seller/seller';
import { DriverTimeDetail } from '@/interfaces/driver/driver';
import { useRouter } from 'next/navigation'
import { DriverDetailedTable } from "@/components/tribe_resident/seller/DriverDetailedTable"

export default function Page(){
  const [user, setUser] = useState<User>()
  const [products, setProducts] = useState<BasicProductInfo[]>([])
  const [driverTimes, setDriverTimes] = useState<DriverTimeDetail[]>([])
  const router = useRouter()
  const today = new Date()
  
  useEffect(() => {
    const _user = UseService.getLocalStorageUser()
    setUser(_user)
    if(_user.name == 'empty'){
      router.replace('/login')
    }   
    get_products(_user)
    get_all_driver_times()
  }, [router])

  const get_products = async(user:User) => {
    if(user != undefined){
      const res_products = await SellerService.get_upload_product(user.id)
      var _products: BasicProductInfo[] = res_products
      setProducts(_products)
    }    
  }
  const get_all_driver_times = async() => {
    try{
      const res_times = await DriverService.get_all_driver_times()
      var _times: DriverTimeDetail[] = res_times
      console.log('times', res_times)
      setDriverTimes(_times)
    }
    catch(e){
      console.log('Get Driver time error occurs')
    }
    
    
  }
  return(
    <div>
      <NavigationBar/> 
      <Tabs defaultValue="on shelf">
        <TabsList className="w-full">
          <TabsTrigger value="on shelf" className="w-1/3">我的架上商品</TabsTrigger>
          <TabsTrigger value="history" className="w-1/3">我的歷史商品</TabsTrigger>
          <TabsTrigger value="driver" className="w-1/3">司機運送時間</TabsTrigger>
        </TabsList>
        <TabsContent value="on shelf" className="justify-items-center text-center" >
          <ProductTable products={products.filter((product) => product.off_shelf_date >= today.toISOString().split('T')[0])}/>
          <SellerDialog/>
        </TabsContent>
        <TabsContent value="history" className="justify-items-center text-center">
          <ProductTable products={products.filter((product) => product.off_shelf_date < today.toISOString().split('T')[0])}/>
        </TabsContent>    
        <TabsContent value="driver" className="justify-items-center text-center">
          <DriverDetailedTable drivers={driverTimes.filter((time) => time.date >= today.toISOString().split('T')[0])}/>
        </TabsContent>    
      </Tabs>
    </div>
  )
}