import React, { useState } from "react";
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import  SellerService from '@/services/seller/seller'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface middleProps {
  handleSendImg: (img: string) => void
}

const UploadRegion: React.FC<middleProps> = (prop) => {
  const [img, setImg] = useState<string | null>(null)

  const { handleSendImg } = prop
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; //get file
    if (file) {
      const fileData = new FileReader();
      const base64Prefix: string = "base64,";
      
      fileData.addEventListener("load", async() => {
        const result = fileData.result as string
        setImg(result)
        //Take the base64 part of image
        const base64Data: string = result.split(base64Prefix)[1]
        handleSendImg(base64Data)
        console.log(base64Data)  
      });
      fileData.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
    <div className="col-span-1 flex items-center text-left">
      <Label htmlFor="picture" className="text-center lg:text-2xl text-md">
        圖片上傳
      </Label>
    </div>
    <div className="col-span-3">
      <Input id="picture" type="file" onChange={handleChange} className="w-full" />
    </div>
    {img && (
      <div className="col-span-4 flex justify-center mt-4">
        <img src={img} className="h-full" alt="uploaded" />
      </div>
    )}
  </div>  
  );
}

export default function SellerDialog() {
  const [imgBase64, setImgBase64] = useState('')
  
  const handleConfirm = async() =>{
    //get image URL
    const res = await SellerService.upload_image(imgBase64)
    console.log(res.status)
    console.log(res.imgLink)
  }
  
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
          <UploadRegion handleSendImg={setImgBase64}/>
        </div>
        <DialogFooter className="items-center">
          <Button type="submit" className="lg:text-2xl text-lg w-1/2" onClick={handleConfirm}>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



