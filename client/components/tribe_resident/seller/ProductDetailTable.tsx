import React, { useState, useEffect } from "react"
import SellerService from '@/services/seller/seller'
import { ProductOrderInfo } from "@/interfaces/tribe_resident/seller/seller"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from 'next/navigation'

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
  const [message, setMessage] = useState('')
  const [check, setCheck] = useState<Number[]>([])

  const router = useRouter()
  useEffect(() => {
    // Ensure localStorage is only accessed on the client-side
    if (typeof window !== 'undefined') {
      const productId = localStorage.getItem('@current_seller_product_id')
      if (productId != null) {
        get_product_order(parseInt(productId))
      }
    }
  }, [])
  const get_product_order = async(productId: Number) => {
    const res:ProductOrderInfo[] = await SellerService.get_product_order(productId)
    if(res.length == 0)
      setMessage('目前尚無購買者')
    res.map((order)=> setTotal(total + Number(order.quantity) * Number(order.product_price)))
    setOrders(res)

  }
 
  const handleIsPut: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const target = event.target as HTMLButtonElement
    const id = parseInt(target.id)
    if(check.includes(id))
      setCheck(check.filter((element) => element != id))
    else
      check.push(id)
  }
  const handleConfirmCheck = () =>{
    try{
      const res = SellerService.check_is_put({"order_ids": check})
      router.push("/tribe_resident/seller")  
    }
    catch(e){
      console.log(e)
    }
    
  }

 
  return (
    <div>
      {orders.length == 0 &&
      <p className="text-lg lg:text-2xl ml-5">
        {message}
      </p>}
      {orders.length != 0 &&
      <div>
        <Button className="mb-4" onClick={handleConfirmCheck}>確認已放置至司機拿取地的訂單勾選無誤</Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-lg lg:text-2xl whitespace-nowrap">已放置</TableHead>
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
                <TableCell className="text-center text-md lg:text-lg">
                  <Checkbox id = {order.order_id.toString()} defaultChecked={order.is_put} disabled={order.is_put} onClick={handleIsPut}/>
                </TableCell>
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
      </div>
      }
    </div>
  )
}
