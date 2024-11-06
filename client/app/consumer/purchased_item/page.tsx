'use client'
import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationBar } from "@/components/NavigationBar"
import { OrderedProductTable } from "@/components/consumer/OrderedProductTable"
import { ArrivedProductTable } from "@/components/consumer/ArrivedProductTable"
import ConsumerService from '@/services/consumer/consumer'
import UserSrevice from '@/services/user/user'
import { User, PurchasedProduct } from '@/services/interface'
import { useRouter } from 'next/navigation'

export default function Page(){
  const [user, setUser] = useState<User>()
  const [purchasedItems, setPurchasedItems] = useState<PurchasedProduct[]>([])
  const router = useRouter()
  useEffect(() => {
    const _user = UserSrevice.getLocalStorageUser();
    setUser(_user);
    if (_user.name === 'empty') {
      router.replace('/login');
    }
    get_purchased_items(_user);
  }, [router]); // Add 'router' to the dependency array
  const get_purchased_items = async(user: User) => {
    try {
      const res = await ConsumerService.get_purchased_items(user.id)
      setPurchasedItems(res) 
    }
    catch(e){
      console.log(e)
    }
  } 
 
  return(
    <div>
      <NavigationBar/> 
      <Tabs defaultValue="ordered">
        <TabsList className="w-full">
          <TabsTrigger value="ordered" className="w-1/2">待出貨商品</TabsTrigger>
          <TabsTrigger value="arrived" className="w-1/2">待收貨商品</TabsTrigger>
        </TabsList>
        <TabsContent value="ordered" className="justify-items-center text-center" >
          <OrderedProductTable products={purchasedItems.filter((item) => item.status != '已送達')}/>
        </TabsContent>
        <TabsContent value="arrived" className="justify-items-center text-center">
          <ArrivedProductTable products={purchasedItems.filter((item) => item.status == '已送達')} user={user != undefined?user:{id:0, name:'empty', phone: 'empty', location:'empty',is_driver:false}}/>
        </TabsContent>    
      </Tabs>
    </div>
  )
}