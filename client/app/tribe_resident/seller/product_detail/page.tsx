'use client'
import React, { useState, useEffect } from "react"
import { NavigationBar } from "@/components/NavigationBar";
import { ProductDetailTable } from "@/components/tribe_resident/seller/ProductDetailTable";
import SellerService from '@/services/seller/seller'
import { ProductInfo } from '@/services/interface'
export default function Page(){
  const [productInfo, setProductInfo] = useState<ProductInfo>()
  useEffect(()=>{
    let product_id = localStorage.getItem('@current_seller_product_id')
    if(product_id != null){
        get_product_info(parseInt(product_id))
    }
  }, [])
  const get_product_info = async(productId: Number) =>{
    const res = await SellerService.get_product_info(productId)
    setProductInfo(res)
  }
  return(
    <div>
      <NavigationBar/>
      <div>
        <p>{productInfo?.name}</p>
      </div>
      <ProductDetailTable />
    </div>
  )

}