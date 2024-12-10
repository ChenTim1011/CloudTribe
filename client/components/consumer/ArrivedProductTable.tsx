import React, { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PurchasedProduct } from '@/interfaces/consumer/consumer';
import { User } from '@/interfaces/user/user';
import { NavigationBar } from "@/components/NavigationBar"
import { ProductDetailDialog } from '@/components/consumer/ProductDetailDialog'
import Link from "next/link"
import ConsumerService from '@/services/consumer/consumer'
import { useRouter } from 'next/navigation'


interface arrivedProductProp {
  products:PurchasedProduct[]
  user: User
}
export const ArrivedProductTable:React.FC<arrivedProductProp> = (prop) => {
  const router = useRouter()
  const handleConfirm: React.MouseEventHandler<HTMLButtonElement> = async(event) => {
    const target = event.target as HTMLButtonElement
    console.log('id', target.id)
    try{
      const res = await ConsumerService.update_order_status_to_confirmed(parseInt(target.id))
      console.log('res', res)
    }
    catch(e){
      console.log(e)
    }
    alert('確認商品成功');
    router.push('/consumer')
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="flex flex-row w-screen text-center">
            <TableHead className="text-center lg:text-lg text-md w-1/4">訂單編號</TableHead>
            <TableHead className="text-center lg:text-lg text-md w-1/4">商品名稱</TableHead>
            <TableHead className="text-center lg:text-lg text-md w-1/4">總金額</TableHead>
            <TableHead className="text-center lg:text-lg text-md w-1/4">確認商品</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody> 
          {prop.products.filter(product => product.status=='已送達').map((product) => (
            <TableRow key={product.order_id.toString()} className="flex flex-row items-center">
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.order_id.toString()}</TableCell>
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.product_name}</TableCell>
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{(Number(product.product_price) * Number(product.quantity)).toString()}</TableCell>
                <TableCell className="w-1/4 text-center">
                <Button id={product.order_id.toString()}  variant='outline' className="hover:bg-black hover:text-white" onClick={handleConfirm}>確認</Button>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
        
      </Table>
      <p className="lg:text-2xl text-lg bg-[#E0EBAF] text-left m-3 text-center">商品取貨地:{prop.user.location}</p>
    </div>
  )
}