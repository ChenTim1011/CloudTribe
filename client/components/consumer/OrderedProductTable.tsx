import React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PurchasedProduct } from "@/interfaces/consumer/consumer"
import { ProductDetailDialog } from '@/components/consumer/ProductDetailDialog'


interface orderedProductProp {
  products:PurchasedProduct[]
}
export const OrderedProductTable:React.FC<orderedProductProp> = (prop) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="flex flex-row w-screen text-center">
          <TableHead className="text-center lg:text-lg text-md w-1/4">訂單編號</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">商品名稱</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">總金額</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">詳細資訊</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody> 
        {prop.products.map((product) => (
          <TableRow key={product.order_id.toString()} className="flex flex-row items-center">
            <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.order_id.toString()}</TableCell>
            <TableCell className="text-center lg:text-lg text-balance w-1/4">{product.product_name}</TableCell>
            <TableCell className="text-center lg:text-lg text-balance w-1/4">{(Number(product.product_price) * Number(product.quantity)).toString()}</TableCell>
            <TableCell className="w-1/4 text-center">
              <ProductDetailDialog products={prop.products} order_id={product.order_id}/>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
  )
}