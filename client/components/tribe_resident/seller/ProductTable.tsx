import React from "react"
import { BasicProductInfo } from '@/services/interface'
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
import { useRouter } from "next/navigation"


interface sellerProp {
  products: BasicProductInfo[]
}
export const ProductTable:React.FC<sellerProp> = (prop) => {
  const router = useRouter()
  
  const handleCheckDetail:React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const target = event.target as HTMLButtonElement
    const id = target.id.split('-')[1]
    console.log('id',id)
    localStorage.setItem('@current_seller_product_id', id)
    router.push("/tribe_resident/seller/product_detail")

  }
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
          <TableRow key={product.id.toString()} className="flex flex-row items-center">
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.upload_date}</TableCell>
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.name}</TableCell>
            <TableCell className="w-1/3">
              <Button  id={'link-'+ product.id.toString()} className='items-center' onClick={handleCheckDetail} >
                查看
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
  )
}