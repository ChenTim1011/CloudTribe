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
  useEffect(() => {
    let productId = localStorage.getItem('@current_seller_product_id')
    if(productId != null)
      get_product_order(parseInt(productId))
 
  }, [])
  const get_product_order = async(productId: Number) => {
    const res = await SellerService.get_product_order(productId)
    setOrders(res)
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left text-lg whitespace-nowrap">訂單編號</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">購買者姓名</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">購買數量</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">總金額</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">訂單狀態</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">下單日期</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id.toString()}>
            <TableCell className="text-left">{order.order_id.toString()}</TableCell>
            <TableCell className="text-left">{order.buyer_name}</TableCell>
            <TableCell className="text-left">{order.quantity.toString()}</TableCell>
            <TableCell className="text-left">{(Number(order.quantity) * Number(order.product_price)).toString()}</TableCell>
            <TableCell className="text-left">{order.status}</TableCell>
            <TableCell className="text-left">{order.timestamp.split(' ')[0]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
