import React, { useState, useEffect } from "react"
import SellerService from '@/services/seller/seller'
import { ProductOrderInfo } from "@/services/interface"
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

export const ProductDetailTable = ()=> {
  const [orders, setOrders] = useState<ProductOrderInfo[]>([])
  const [total, setTotal] = useState(0)
  useEffect(() => {
    let productId = localStorage.getItem('@current_seller_product_id')
    if(productId != null)
      get_product_order(parseInt(productId))
    
 
  }, [])
  const get_product_order = async(productId: Number) => {
    const res:ProductOrderInfo[] = await SellerService.get_product_order(productId)
    res.map((order)=> setTotal(total + Number(order.quantity) * Number(order.product_price)))
    setOrders(res)

  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">訂單編號</TableHead>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">購買者姓名</TableHead>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">購買數量</TableHead>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">總金額</TableHead>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">訂單狀態</TableHead>
          <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">下單日期</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id.toString()}>
            <TableCell className="text-center text-md lg:text-lg">{order.order_id.toString()}</TableCell>
            <TableCell className="text-center text-md lg:text-lg whitespace-nowrap">{order.buyer_name}</TableCell>
            <TableCell className="text-center text-md lg:text-lg whitespace-nowrap">{order.quantity.toString()}</TableCell>
            <TableCell className="text-center text-md lg:text-lg whitespace-nowrap">{(Number(order.quantity) * Number(order.product_price)).toString()}</TableCell>
            <TableCell className="text-center text-md lg:text-lg whitespace-nowrap">{order.status}</TableCell>
            <TableCell className="text-center text-md lg:text-lg whitespace-nowrap">{order.timestamp.split(' ')[0]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={1} className="text-center text-md lg:text-lg whitespace-nowrap">目前訂單數量</TableCell>
          <TableCell colSpan={5} className="text-left text-md lg:text-lg whitespace-nowrap">{orders.length}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={1} className="text-center text-md lg:text-lg whitespace-nowrap">目前總銷售額</TableCell>
          <TableCell colSpan={5} className="text-left text-md lg:text-lg whitespace-nowrap">${total}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
