import React from "react"
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

export const ProductDetailTable= ()=> {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left text-lg whitespace-nowrap">訂單編號</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">購買者姓名</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">購買數量</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">總金額</TableHead>
          <TableHead className="text-left text-lg whitespace-nowrap">商品狀態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="text-left">{invoice.invoice}</TableCell>
            <TableCell className="text-left">{invoice.invoice}</TableCell>
            <TableCell className="text-left">{invoice.paymentStatus}</TableCell>
            <TableCell className="text-left">{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
