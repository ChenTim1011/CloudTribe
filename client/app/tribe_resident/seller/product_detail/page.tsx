'use client'
import React, { useState, useEffect } from "react"
import { NavigationBar } from "@/components/NavigationBar";
import { ProductDetailTable } from "@/components/tribe_resident/seller/ProductDetailTable";
import SellerService from '@/services/seller/seller'
import { ProductInfo } from '@/interfaces/tribe_resident/seller/seller';
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation'

export default function Page(){
  const [productInfo, setProductInfo] = useState<ProductInfo>()
  const router = useRouter()
  useEffect(()=>{
    if (typeof window !== 'undefined') {
      let product_id = localStorage.getItem('@current_seller_product_id')
    if(product_id != null){
        get_product_info(parseInt(product_id))
      }
  }
  }, [])
  const get_product_info = async(productId: Number) =>{
    const res = await SellerService.get_product_info(productId)
    setProductInfo(res)
  }
  const handleDeleteButton = () => {
    if(productInfo != undefined){
      try {
        const res = SellerService.delete_agri_product(productInfo.id)
        console.log('res:',res)
      }
      catch(e){
        console.log(e)
      }
      router.push('/tribe_resident/seller')

    }
    
  }
  return(
    <div>
      <NavigationBar/>
      <div className="items-center border-y-2 border-black">
        <div className="flex flex-row justify-center items-center lg:space-x-5 space-x-3 bg-[#E0EBAF] lg:p-8 p-4">
          
          <img
            src={productInfo?.img_link || '/default-image.png'} 
            alt={productInfo?.name || 'Product Image'} 
            width={200} 
            height={200} 
            className="lg:w-2/12 w-1/2"
          />
          <div className="flex flex-col text-md lg:text-2xl leading-normal lg:leading-relaxed">
            <Link href = '/tribe_resident/seller' className="underline">
              返回上架商品頁面
            </Link>
            <p>商品名稱:{productInfo?.name}</p>
            <p>商品價格:${productInfo?.price.toString()} / {productInfo?.unit}</p>
            <p>商品總數量:{productInfo?.total_quantity.toString()}</p>
            <p>下架日期:{productInfo?.off_shelf_date}</p>
            {/*<Button className="bg-red-600 w-20" onClick={handleDeleteButton}>刪除商品</Button>*/}
            <AlertDialog>
              <AlertDialogTrigger className="bg-red-600 w-28 text-white p-1" >刪除商品</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除此商品嗎</AlertDialogTitle>
                  <AlertDialogDescription>
                    此動作無法復原，請確認後再操作
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteButton}>刪除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      <div className="h-4"/>
      <ProductDetailTable />
    </div>
  )

}
