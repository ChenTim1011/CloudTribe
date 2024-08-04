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
import { NavigationBar } from "@/components/NavigationBar"
import Link from "next/link"

const products =[
  {
    id:1,
    upload_date:'2024-08-05',
    name:'蔬菜'

  }
]

export default function Page(){
  return (
    <div>
    <NavigationBar/>
    <Button className="m-3">
      <Link href="/consumer">
        返回商品頁面
      </Link>
    </Button>
    <Table>
      <TableHeader>
        <TableRow className="flex flex-row w-screen text-center">
          <TableHead className="text-center text-lg w-1/3">購買日期</TableHead>
          <TableHead className="text-center text-lg w-1/3">商品名稱</TableHead>
          <TableHead className="text-center text-lg w-1/3">詳細資訊</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody> 
        {products.map((product) => (
          <TableRow key={product.id.toString()} className="flex flex-row items-center">
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.upload_date}</TableCell>
            <TableCell className="text-center lg:text-lg text-balance w-1/3">{product.name}</TableCell>
            <TableCell className="w-1/3 text-center">
              <Button>
                查看 
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
    </div>
  )
}