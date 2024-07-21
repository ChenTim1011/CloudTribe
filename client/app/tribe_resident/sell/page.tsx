import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function SellerDialog() {
  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-black text-white w-1/2 bottom-0 fixed left-1/4 my-4">新增商品</Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-[800px] max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="lg:text-3xl text-2xl">請輸入上架商品資訊</DialogTitle>
          <DialogDescription className="lg:text-lg text-sm">
            請確實填寫內容
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left lg:text-2xl text-md">
              商品名稱
            </Label>
            <Input id="name" placeholder="請輸入10個字以內的商品名稱" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-left lg:text-2xl text-md">
              商品價格
            </Label>
            <Input id="amount"className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date"  className="text-left lg:text-2xl text-md">
              下架日期
            </Label>
            <Input id="date" placeholder="2024/01/26" className="col-span-3" />
          </div>
        </div>
        <DialogFooter className="items-center">
          <Button type="submit" className="lg:text-2xl text-lg w-1/2">確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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