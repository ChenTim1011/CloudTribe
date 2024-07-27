import React, { useState } from "react"

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

export default function OnShelfTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="flex flex-row w-screen">
          <TableHead className="text-center text-lg w-1/3">商品名稱</TableHead>
          <TableHead className="text-center text-lg w-1/3">剩餘數量</TableHead>
          <TableHead className="text-center text-lg w-1/3">下架日期</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice} className="flex flex-row">
            <TableCell className="text-center text-lg text-balance w-1/3">{invoice.invoice}</TableCell>
            <TableCell className="text-center text-lg text-balance w-1/3">{invoice.paymentStatus}</TableCell>
            <TableCell className="text-center text-lg text-balance w-1/3">{invoice.paymentMethod}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
  )
}