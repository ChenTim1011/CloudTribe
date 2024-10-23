'use client'
import React, { useState, useEffect } from "react";
import { User, UploadItem } from '@/services/interface'
import UserService from '@/services/user/user'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogClose
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/tribe_resident/seller/DatePicker";
import { CategorySelector } from "@/components/tribe_resident/seller/CategorySelector";
import { UploadRegion } from "@/components/tribe_resident/seller/UploadRegion"


export const SellerDialog = () => {
  const [imgBase64, setImgBase64] = useState('')
  const [date, setDate] = useState<Date>()
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fileType, setFileType] = useState('')
  const [closeDialog, setCloseDialog] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [user, setUser] = useState<User>()
  const [isUploading, setIsUploading] = useState(false)
  const [locationError, setLocationError] = useState('empty')

  useEffect(() => {
    const _user = UserService.getLocalStorageUser()
    setUser(_user)
    if(_user.location == '未選擇'){
      setLocationError('請先點擊右上角的標誌來設定出貨物品放置地點')}
  }, [])

  const handleConfirm = async() =>{
    //get image URL
    if(itemName == '' || itemPrice == '' || date == null || selectedCategory == null || itemQuantity == null)
      setErrorMessage("上面的所有欄位都必須要填寫喔!!")
    else if(itemName.length > 20)
      setErrorMessage("商品名稱大於20字")
    else if(isNaN(parseInt(itemPrice)) || (parseInt(itemPrice)) <= 0)
      setErrorMessage("金額欄位輸入錯誤")
    else if(isNaN(parseInt(itemQuantity)) || (parseInt(itemQuantity)) <= 0)
      setErrorMessage("數量欄位輸入錯誤")
    else if(new Date(date) < new Date())
      setErrorMessage("時間選擇有誤")
    else if(fileType == '')
      setErrorMessage("未選擇任何檔案")
    else if(fileType == 'notImage')
      setErrorMessage("上傳的檔案非圖片")
    else{
      setIsUploading(true)
      try{
        var res_img = await SellerService.upload_image(imgBase64)
      }
      catch(e){
        console.log(e)
      }
    
      const item: UploadItem = {
        name: itemName,
        price: itemPrice,
        category: selectedCategory,
        total_quantity: itemQuantity,
        off_shelf_date: date.toLocaleDateString().replaceAll("/", "-"),
        img_link: res_img.img_link,
        img_id: res_img.img_id,
        seller_id: user && user.id ? Number(user.id) : null
      }
      try{
        const res_item = await SellerService.upload_item(item)
        setCloseDialog(true)
      }
      catch(e){
        setErrorMessage('上傳發生錯誤，請再試一次') 
        setIsUploading(false)
      } 
    }   
  }
  const handleNameButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemName(event.target.value);
    setErrorMessage('')
  }
  const handlePriceButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemPrice(event.target.value);
    setErrorMessage('')
  }
  const handleQuantityButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemQuantity(event.target.value);
    setErrorMessage('')
  }
  const handleDateButton =(date: Date | undefined) => {
    setDate(date)
    setErrorMessage('')
  }
  const handleSelector = (isOpen: boolean, value: string) => {
    setIsSelectorOpen(isOpen)
    setSelectedCategory(value)
  }
  const handleAddItem = () => {
    setCloseDialog(false)
    setIsUploading(false)
  }

  return (
    <div>
      {locationError != 'empty' && (
        <Alert className="bg-red-500 text-white w-1/2">
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-black text-white w-1/2 bottom-0 fixed left-1/4 my-4"
          disabled={locationError != 'empty'? true:false}
          onClick={handleAddItem}>
            新增商品
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-[800px] max-w-[400px] justify-center max-h-[1000px]">
        <DialogHeader>
          <DialogTitle className="lg:text-3xl text-2xl">請輸入上架商品資訊</DialogTitle>
          <DialogDescription className="lg:text-lg text-sm">
            請確實填寫內容
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left lg:text-2xl text-md">
              商品名稱
            </Label>
            <Input 
              id="name" 
              placeholder="請輸入20個字以內的商品名稱" 
              className="col-span-3" 
              onChange={handleNameButton}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-left lg:text-2xl text-md">
              商品價格
            </Label>
            <Input id="amount" className="col-span-3"  onChange={handlePriceButton}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-left lg:text-2xl text-md">
              商品總數
            </Label>
            <Input id="quantity" className="col-span-3" onChange={handleQuantityButton}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-left lg:text-2xl text-md">
              下架日期
            </Label>
            <DatePicker handleSendDate={handleDateButton}/>
          </div>
          <CategorySelector handleIsOpen={handleSelector}/>
          <UploadRegion handleSendImg={setImgBase64} handleSendType={setFileType} handleSendError={setErrorMessage} selectorStatus={isSelectorOpen}/>
        </div>
        {errorMessage && (
          <Alert className="bg-red-500 text-white">
            <AlertTitle>錯誤</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {isUploading && closeDialog != true && (
        <Alert className="text-center bg-yellow-100">
            <AlertDescription className=" text-black text-2xl">
              商品正在上傳中，請稍後...
            </AlertDescription>
          </Alert>
        )}
        {closeDialog != true && isUploading != true &&
        <DialogFooter className="items-center">
          <Button type="submit" className="lg:text-2xl text-lg w-1/2" onClick={handleConfirm} disabled={isSelectorOpen}>確認</Button>
        </DialogFooter>}
        {closeDialog &&
        <Alert className="bg-green-500 text-white">
          <AlertTitle>成功!!</AlertTitle>
          <AlertDescription>商品上傳成功，請關閉表單</AlertDescription>
        </Alert>}
        {closeDialog &&
        <DialogFooter className="items-center">
          <DialogClose asChild>
            <Button type="submit" className="lg:text-2xl text-lg w-1/2">關閉</Button>
          </DialogClose>     
        </DialogFooter>} 
      </DialogContent>
    </Dialog>
    </div>
  )
}



