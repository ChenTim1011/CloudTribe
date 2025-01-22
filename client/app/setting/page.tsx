'use client'
import React, { useState, useEffect } from 'react'
import { LOCATIONS } from "@/constants/constants"
import UserService from '@/services/user/user'
import { NavigationBar } from '@/components/NavigationBar'
import { User } from '@/interfaces/user/user'
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
  const [selectedLocation, setSelectedLocation] = useState('empty')
  const [originLocation, setOriginLocation] = useState('')
  const [user, setUser] = useState<User>()
  const [isUpdating, setisUpdating] = useState(false)
  
  useEffect(() => {
    // Move localStorage access inside useEffect
    if (typeof window !== 'undefined') {
      const _user = UserService.getLocalStorageUser()
      console.log('location:', _user.location)
      setUser(_user)
      setOriginLocation(_user.location)
    }
  }, [])
  
  const handleSaveButton = async() => {
    if(selectedLocation != originLocation && user != undefined){
      try{
        const res = await UserService.update_nearest_location(user.id, selectedLocation)
        if (typeof window !== 'undefined') {
          localStorage.setItem("@user", JSON.stringify({...user, location:selectedLocation}));
        }
      }
      catch(e){
        console.log(e)
      }
    }
    setisUpdating(false)
  }
  return(
    <div className="text-center">
      <NavigationBar/>
      <div className="h-5"/>
      <div className="grid gap-4 ">
        <p>{user?.name}的基本資料</p>
      {/* 
        <Select onValueChange={setSelectedLocation}>
          <div className="grid grid-cols-4 mx-5">
            <div className="col-span-2 flex items-center text-left">
              <Label htmlFor="picture" className="text-center lg:text-2xl text-md">
                離居住地最近的地點
              </Label>
            </div>
            <div className="col-span-2">
              <SelectTrigger className="w-full" disabled={!isUpdating}>
                <SelectValue placeholder={user?.location}/>
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
        </Select>*/}
        
      </div>
{/*
      {!isUpdating && 
      <Button className="my-5" onClick={() => setisUpdating(true)}>
        更改資訊
      </Button>}
      {isUpdating && 
      <Button className="my-5" onClick={handleSaveButton}>
        儲存
      </Button>}
*/}

    </div>
  )

}
