import React from "react"
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NavigationBar } from "@/components/NavigationBar"
import { ProductDetailDialog } from '@/components/consumer/ProductDetailDialog'
import Link from "next/link"

const products =[
  {
    order_id:1,
    name:'蔬菜',
    amount:'200', 
    order_date:'2024-08-05',

  }
]

export const ArrivedProductTable = () => {
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
          {products.map((product) => (
            <TableRow key={product.order_id.toString()} className="flex flex-row items-center">
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.order_id}</TableCell>
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.name}</TableCell>
                <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.amount}</TableCell>
                <TableCell className="w-1/4 text-center">
                <Button variant='outline' className="hover:bg-black hover:text-white">確認</Button>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
        
      </Table>
      <p>商品取貨地</p>
    </div>
  )
}