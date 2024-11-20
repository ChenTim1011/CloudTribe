'use client'
import React, { useState, useEffect } from "react"
import { NavigationBar } from "@/components/NavigationBar";
import { ProductDetailTable } from "@/components/tribe_resident/seller/ProductDetailTable";
import SellerService from '@/services/seller/seller'
import { ProductInfo } from '@/interfaces/tribe_resident/seller/seller';
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Page(){
  const [productInfo, setProductInfo] = useState<ProductInfo>()
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
          
          </div>
        </div>
      </div>
      <div className="h-4"/>
      <ProductDetailTable />
    </div>
  )

}
