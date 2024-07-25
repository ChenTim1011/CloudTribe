'use client'
import React, { useState } from "react"
import SellerDialog from "@/components/seller/SellerDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

export function SellerTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">上架日期</TableHead>
          <TableHead className="text-center">名稱</TableHead>
          <TableHead className="text-center">價格</TableHead>
          <TableHead className="text-center">下架日期</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell>{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>上架商品總數</TableCell>
          <TableCell className="text-center">{invoices.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}



export default function Page(){
  return(
    <div>
      <header className="w-full bg-emerald-200 lg:h-[80px] h-[50px] text-center content-center lg:text-2xl text-md shadow-2xl sticky top-0 z-50">
        <text>我的商品</text>
      </header>
      <Tabs defaultValue="on shelf">
        <TabsList className="w-full">
          <TabsTrigger value="on shelf" className="w-1/3">架上商品</TabsTrigger>
          <TabsTrigger value="off shelf" className="w-1/3">已下架商品</TabsTrigger>
          <TabsTrigger value="sold out" className="w-1/3">已售完商品</TabsTrigger>
        </TabsList>
        <TabsContent value="on shelf" className="justify-items-center text-center">
          <SellerTable/>
          <SellerDialog/>

        </TabsContent>
        <TabsContent value="off shelf" className="text-center">
          <SellerTable/>
        </TabsContent>
        <TabsContent value="sold out" className="text-center">
          <SellerTable/>
        </TabsContent>    
      </Tabs>
     
      
    </div>
  )
}