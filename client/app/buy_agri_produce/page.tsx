
'use client'
import React, { useState, useEffect } from "react";
import { User, ProductInfo } from '@/services/interface'
import UserService from '@/services/user/user'
import SellerService from '@/services/seller/seller'
import { CATEGORIES } from "@/constants/constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import NavigationBar from "@/components/NavigationBar";

export default function Page() {
  const [user, setUser] = useState<User>()
  const [onShelfProducts, setOnShelfProducts] = useState<ProductInfo[]>()
  const [mapItems, setMapItems] = useState<ProductInfo[]>()
  const [searchContent, setSearchContent] = useState('')

  useEffect(() => {
    const _user = UserService.getLocalStorageUser()
    setUser(_user)
    get_on_shelf_product()
  },[]);

  const get_on_shelf_product = async() => {
    const today = new Date()
    console.log(today)
    const products = await SellerService.get_on_shelf_product(today.toLocaleDateString().replaceAll("/", "-"))
    setMapItems(products)
    setOnShelfProducts(products)
  }
  const handleSelect = (value: string) => {
    const products = onShelfProducts?.filter((product) => product.category == value)
    if(products != undefined){
      setMapItems(products)
    }
  }
  const handleSearchRegion: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearchContent(event.target.value);
  }
  const handleSearchButton = () => {
    const products = onShelfProducts?.filter((product) => product.name.includes(searchContent))
    if(products != undefined){
      setMapItems(products)
    }
  }

  return (
    <div className="w-full  bg-gray-200">
      <NavigationBar /> 
      <header className="flex flex-col w-full bg-lime-800 lg:h-[300px] h-[150px] text-center items-center shadow-2xl sticky top-0 z-20">
        <p className="lg:text-5xl text-2xl font-bold tracking-wides lg:py-[50px] py-[10px] text-neutral-50">農產品列表</p>
        <div className="flex flex-col lg:w-1/4 w-3/4 items-center">
          <div className="flex w-full items-center space-x-2 ">
            <Input 
              type="email" 
              placeholder="請輸入農產品名稱" 
              className="lg:text-2xl text-md bg-white lg:h-[60px] h-[30px] border-white border-4 rounded" 
              onChange={handleSearchRegion}/>
            <Button 
              variant="outline" 
              className="text-black text-lg text-center bg-white lg:h-[60px] h-[30px] lg:w-[80px] w-[50px] border-white border-4 rounded"
              onClick={handleSearchButton}>
              搜尋
            </Button>
          </div>
          <div className="lg:h-4 h-1" />

            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇要查尋的類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                {CATEGORIES.map((category) => 
                  <SelectItem key={category.value} value={category.value}>
                    {category.name}
                  </SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
      </header>
      {mapItems?.length == 0 && <text className="lg:text-2xl text-md">查無此類商品</text>}
      <div className="grid lg:grid-cols-4 grid-cols-2 items-center lg:p-28 px-2 py-5">
        {mapItems!= undefined && mapItems.map((product) => (  
          <div className="w-full lg:h-[540px] h-[220px] bg-white border-gray-200 border-4 text-center lg:p-5 p-1">
            <img id={product.id} src={product.imgLink} className="w-full lg:h-[75%] h-[70%]"></img>
            <div className="lg:h-1"/>
            <div className="flex flex-col items-center">
              <text className="lg:text-2xl text-sm">{product.name}</text>
              <text className="lg:text-3xl text-sm text-red-600">${product.price}</text>
              <Button className="bg-black text-white lg:h-10 h-6 lg:w-1/2 w-2/3">
                <FontAwesomeIcon icon={faShoppingCart} className="lg:mr-2" />
                加入購物車
              </Button>
            </div>
          </div>
        ))}
        
      </div>
      
    </div>
  )
}