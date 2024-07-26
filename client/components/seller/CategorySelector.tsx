import React, { useState, useEffect } from "react"
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
  handleIsOpen:(open: boolean) => void
}

export const CategorySelector:React.FC<selectProps> = (prop) => {
  const categories =[
    {
      value: "vegetable",
      name: "蔬菜"
    },
    {
      value: "fruit",
      name: "水果"
    },
    {
      value: "egg",
      name: "雞蛋"
    },
    {
      value: "bean",
      name: "豆類"
    },
    {
      value: "rice",
      name: "稻米"
    },
    {
      value: "dairy",
      name: "乳製品"
    },
    {
      value: "seasoning",
      name: "調味料"
    },
    {
      value: "other",
      name: "其他"
    },
  ]
  const [isOpen, setIsOpen] = useState(false);
  const { handleIsOpen } = prop
  useEffect(() =>{setTimeout(() => {handleIsOpen(isOpen)}, 10)},[isOpen])
  
  return (
    <div>
    <Select onOpenChange={(open) =>open?setIsOpen(true):setIsOpen(false)}>
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
        <SelectGroup >
          {categories.map((category) => 
          <SelectItem value={category.value}>
            {category.name}
          </SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
    </div>
  )
}
