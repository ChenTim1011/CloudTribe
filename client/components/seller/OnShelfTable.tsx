import React, { useEffect, useState } from "react"
import SellerService from '@/services/seller/seller'
import { User, BasicProductInfo } from '@/services/interface'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface sellerProp {
  products: BasicProductInfo[]
}
const OnShelfTable:React.FC<sellerProp> = (prop) => {

  return (

    <Table>
      <TableHeader>
        <TableRow className="flex flex-row w-screen">
          <TableHead className="text-center text-lg w-1/3">上架日期</TableHead>
          <TableHead className="text-center text-lg w-1/3">商品名稱</TableHead>
          <TableHead className="text-center text-lg w-1/3">詳細資訊</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody> 
        {prop.products.map((product) => (
          <TableRow key={product.id} className="flex flex-row items-center">
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.uploadDate}</TableCell>
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.name}</TableCell>
            <TableCell className="w-1/3">
              <Button className='items-center'>
                查看 
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
  )
}
export default OnShelfTable