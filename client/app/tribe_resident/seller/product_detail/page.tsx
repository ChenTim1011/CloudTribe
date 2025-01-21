'use client'
import React, { useState, useEffect } from "react"
import { NavigationBar } from "@/components/NavigationBar";
import { ProductDetailTable } from "@/components/tribe_resident/seller/ProductDetailTable";
import SellerService from '@/services/seller/seller'
import { ProductInfo } from '@/interfaces/tribe_resident/seller/seller';
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategorySelector } from "@/components/tribe_resident/seller/CategorySelector";
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

export default function Page(){
  const [productInfo, setProductInfo] = useState<ProductInfo>()
  const [date, setDate] = useState<Date>()
  const [closeDialog, setCloseDialog] = useState(false)
  const router = useRouter()
  
  useEffect(()=>{
    if (typeof window !== 'undefined') {
      let product_id = localStorage.getItem('@current_seller_product_id')
    if(product_id != null){
        get_product_info(parseInt(product_id))
      }
  }
  }, [])
  const get_product_info = async(productId: Number) =>{
    const res = await SellerService.get_product_info(productId)
    setProductInfo(res)
  }
  const handleDeleteButton = () => {
    if(productInfo != undefined){
      try {
        const res = SellerService.delete_agri_product(productInfo.id)
        console.log('res:',res)
      }
      catch(e){
        console.log(e)
      }
      router.push('/tribe_resident/seller')

    }
  }
  const handleConfirm = () =>{
    try{
      if(productInfo != undefined && date != undefined)
        var res = SellerService.update_offshelf_date(productInfo.id, date.toLocaleDateString().replaceAll("/", "-"))
    }
    catch(e){
      console.log(e)
    }
    setCloseDialog(true)
  }
  return(
    <div>
      <NavigationBar/>
      <div className="items-center border-y-2 border-black">
        <div className="flex flex-row justify-center items-center lg:space-x-5 space-x-3 bg-[#E0EBAF] lg:p-8 p-4">
          
          <img
            src={productInfo?.img_link || '/default-image.png'} 
            alt={productInfo?.name || 'Product Image'} 
            width={200} 
            height={200} 
            className="lg:w-2/12 w-1/2"
          />
          <div className="flex flex-col text-md lg:text-2xl leading-normal lg:leading-relaxed">
            <Link href = '/tribe_resident/seller' className="underline">
              返回上架商品頁面
            </Link>
            <p>商品名稱:{productInfo?.name}</p>
            <p>商品價格:${productInfo?.price.toString()} / {productInfo?.unit}</p>
            <p>商品總數量:{productInfo?.total_quantity.toString()}</p>
            <p>下架日期:{productInfo?.off_shelf_date}</p>
            {/*<Button className="bg-red-600 w-20" onClick={handleDeleteButton}>刪除商品</Button>*/}
            <AlertDialog>
              <AlertDialogTrigger className="bg-red-600 w-28 text-white p-1" >刪除商品</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除此商品嗎</AlertDialogTitle>
                  <AlertDialogDescription>
                    此動作無法復原，請確認後再操作
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteButton}>刪除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-black w-28 text-white p-1 my-2"
                  onClick={()=>setCloseDialog(false)}>
                    修改下架日期
                </Button>
              </DialogTrigger>

              <DialogContent className="lg:max-w-[800px] max-w-[400px] h-[90vh] flex flex-col">
                <DialogHeader className="flex-none">
                 
                  <DialogDescription className="lg:text-lg text-sm">
                    其他商品資訊無法修改，如果尚未有購買者，請刪除商品並重新上架。
                    如果已有購買者，請自行更改下架日期並重新上架商品。
                  </DialogDescription>
                </DialogHeader>

                
                <div className="flex-1 overflow-y-auto px-4">
                  <div className="space-y-4">
                    <div className="mb-6 flex flex-col items-center">
                      <Label className="block text-left lg:text-2xl text-md mb-2 self-start">
                        下架日期
                      </Label>
                      <div className="flex justify-center w-full">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border bg-white"
                        />
                      </div>
                    </div>
                </div>
                {closeDialog != true &&
                <DialogFooter className="items-center">
                 <Button type="submit" className=" mt-5 lg:text-2xl text-lg w-1/2" onClick={handleConfirm}>確認修改</Button>
                </DialogFooter>}
                {closeDialog &&
                <div>
                  <Alert className="text-center bg-yellow-100 my-2">
                    <AlertDescription className=" text-black text-2xl">
                    修改成功!!
                  </AlertDescription>
                  </Alert>
                  <DialogFooter className="items-center">
                    <DialogClose asChild>
                      <Button type="submit" className="lg:text-2xl text-lg w-1/2">關閉</Button>
                    </DialogClose>     
                  </DialogFooter>
                </div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="h-4"/>
      <ProductDetailTable />
    </div>
  )

}
