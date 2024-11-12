import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PurchasedProduct } from "@/services/interface"
import Image from 'next/image';

interface DetailDialogProp {
  products: PurchasedProduct[]
  order_id: Number
}

export const ProductDetailDialog:React.FC<DetailDialogProp> = (prop) => {
  const [item, setItem] = useState<PurchasedProduct>()
  useEffect(() => {
    const product = prop.products.find((product) => product.order_id === prop.order_id);
    setItem(product);
  }, [prop.order_id, prop.products]); // Add 'prop.order_id' and 'prop.products' to the dependency array
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">查看</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="lg:text-2xl text-lg">其他資訊</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <img
            src={item?.img_url || '/default-image.png'} 
            alt={item?.product_name || 'Product Image'} 
            width={150} 
            height={150} 
          />
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl text-md col-span-2">商品名稱</p>
            <p className="lg:text-2xl text-md col-span-3">{item?.product_name}</p>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl text-md col-span-2">購買日期</p>
            <p className="lg:text-2xl text-md col-span-3">{item?.timestamp.split(' ')[0]}</p>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl col-span-2">購買數量</p>
            <p className="lg:text-2xl col-span-3">{item?.quantity.toString()}</p>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl col-span-2">商品狀態</p>
            <p className="lg:text-2xl col-span-3">{item?.status}</p>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}
