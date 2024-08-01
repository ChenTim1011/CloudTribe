'use client'
import React, { useState } from 'react'
import { LOCATIONS } from "@/constants/constants"
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
export default function Page(){
  const [selectedValue, setSelectedValue] = useState('empty')
  return(
    <div className="text-center">
      <p>Setting</p>
      <p>User</p>
      <div className="grid gap-4 ">
        <Select onValueChange={setSelectedValue}>
          <div className="grid grid-cols-4 mx-5">
            <div className="col-span-2 flex items-center text-left">
              <Label htmlFor="picture" className="text-center lg:text-2xl text-md">
                離居住地最近的地點
              </Label>
            </div>
            <div className="col-span-2">
              <SelectTrigger className="w-full" >
                <SelectValue placeholder="未選擇" defaultValue='empty'/>
              </SelectTrigger>
            </div>
          </div>
          <SelectContent>
            <SelectGroup>
              {LOCATIONS.map((place) => 
              <SelectItem key={place.id} value={place.value}>
                {place.value}
              </SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        
      </div>

      <Button className="my-5">更改資訊</Button>
    </div>
  )

}