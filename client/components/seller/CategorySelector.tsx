import React, { useState, useEffect } from "react"
import { CATEGORIES } from "@/constants/constants"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
interface selectProps {
  handleIsOpen:(open: boolean, value: string) => void
}

export const CategorySelector:React.FC<selectProps> = (prop) => {
 
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('')
  const { handleIsOpen } = prop
  useEffect(() =>{setTimeout(() => {handleIsOpen(isOpen, selectedValue)}, 10)},[isOpen])
  
  return (
    <Select onValueChange={setSelectedValue} onOpenChange={(open) =>open?setIsOpen(true):setIsOpen(false)}>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 flex items-center text-left">
          <Label htmlFor="picture" className="text-center lg:text-2xl text-md">
            商品種類
          </Label>
        </div>
        <div className="col-span-3">
          <SelectTrigger className="w-full" >
            <SelectValue placeholder="選擇商品種類" />
          </SelectTrigger>
        </div>
      </div>
      
      <SelectContent>
        <SelectGroup>
          {CATEGORIES.map((category) => 
          <SelectItem key={category.value} value={category.value}>
            {category.name}
          </SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
