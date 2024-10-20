import React, { useState } from "react"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image';

interface middleProps {
  handleSendImg: (img: string) => void
  handleSendType: (fileType: string) => void
  handleSendError: (error: string) => void
  selectorStatus:boolean
} 
export const UploadRegion: React.FC<middleProps> = (prop) => {
  const [img, setImg] = useState<string | null>(null)
  const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"]
  
  const { handleSendImg, handleSendType, handleSendError} = prop
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSendError('')
    setImg(null)
    const file = event.target.files?.[0]; //get file
    if(file == undefined){
      handleSendType('')
      handleSendError('未選擇任何檔案')
    }
    else if(file?.type != undefined &&  allowedFileTypes.includes(file?.type)){
      handleSendType(file?.type)
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
    else {
        handleSendType('notImage')
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
        <Input id="picture" type="file" onChange={handleChange} disabled={prop.selectorStatus} className="w-full" />
      </div>
      {img && (
        <div className="col-span-4 flex justify-center">
          <Image 
            src={img} 
            alt="uploaded" 
            width={350} 
            height={250} 
            className="lg:max-h-[350px] max-h-[250px]"
            style={{ objectFit: 'contain' }}
          />
        </div>  
      )}
    </div>  
  );
}
