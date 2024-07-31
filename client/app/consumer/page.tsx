'use client'
import React, { useState, useEffect } from "react";
import Link from 'next/link'
import { User, ProductInfo } from '@/services/interface'
import UserService from '@/services/user/user'
import ConsumerService from '@/services/consumer/consumer'
import { AddCartRequest } from "@/services/interface";
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
import PaginationDemo from "@/components/tribe_resident/buyer/PaginationDemo";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Page() {
  const ITEM_PER_PAGE = 16
  const [user, setUser] = useState<User>()
  const [onShelfProducts, setOnShelfProducts] = useState<ProductInfo[]>()
  const [mapItems, setMapItems] = useState<ProductInfo[]>()
  const [searchContent, setSearchContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [cartMessage, setCartMessage] = useState('empty')

  useEffect(() => {
    const _user = UserService.getLocalStorageUser()
    setUser(_user)
    get_on_sell_product()
  },[]);

  const get_on_sell_product = async() => {
    let today = new Date()
    try{
      const products = await ConsumerService.get_on_sell_product(today.toLocaleDateString().replaceAll("/", "-"))
      setMapItems(products)
      setOnShelfProducts(products)
    }
    catch(e){
      console.log('Show agricultural produce error occur')
    }
    
    
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
  const handleAddCart = async(produceId: Number) => {
    const inputElement = document.getElementById(`quantity-${produceId}`) as HTMLInputElement | null
    if(user != undefined && inputElement != undefined){
      let req: AddCartRequest = {
        buyerId: user?.id.toString(), 
        produceId: produceId, 
        quantity:parseInt(inputElement?.value)}

      try{
        const res = await ConsumerService.add_shopping_cart(req)
        if(res == "shopping cart has already had this item"){
          setCartMessage("此商品被重複加入購物車")
          setTimeout(() => setCartMessage('empty'), 2000);
        } 
        else{
          setCartMessage("成功加入購物車!")
          setTimeout(() => setCartMessage('empty'), 2000);
        }     
      }
      catch(e){
        setCartMessage("加入購物車失敗")
        setTimeout(() => setCartMessage('empty'), 2000);
      }  
    }
      

  }
  const startIdx = (currentPage - 1) * ITEM_PER_PAGE;
  const endIdx = startIdx + ITEM_PER_PAGE;
  const currentData = mapItems?.slice(startIdx, endIdx);

  return (
    <div className="w-full bg-gray-200">
      <NavigationBar /> 
      <header className="flex flex-col w-full bg-lime-800 lg:h-[300px] h-[160px] text-center items-center shadow-2xl sticky top-0 z-20">
       
        <p className="lg:text-5xl text-3xl font-bold tracking-wides lg:py-[50px] py-[15px] text-neutral-50">部落農產品</p>
        <div className="flex flex-col lg:w-1/4 w-3/4">
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
          <div className="lg:h-4 h-2" />

            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-full h-8 lg:h-12">
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
        <Button 
          variant="outline" 
          className="absolute right-1 top-1 lg:px-4 lg:py-2 p-1 lg:text-2xl text-sm font-bold border-2 border-black-500 text-black-500 hover:bg-blue-500 hover:text-white">
          <Link href="/consumer/shopping_cart">
            <FontAwesomeIcon icon={faShoppingCart} className="lg:mr-2"/>
            購物車
          </Link> 
        </Button>
        {cartMessage != 'empty' && 
        <Alert className="absolute bg-yellow-300 text-black right-1 top-full w-fit text-center px-4 py-2">
          <AlertDescription className="lg:text-3xl text-md">
            {cartMessage}
          </AlertDescription>
        </Alert>}
      </header>
      
      {mapItems?.length == 0 && <text className="lg:text-2xl text-md">查無此類商品</text>}
      <div className="grid lg:grid-cols-4 grid-cols-2 items-center lg:p-28 px-2 py-5">
        {currentData!= undefined && currentData.map((product) => (  
          <div key={product.id.toString()} className="w-full lg:h-[550px] h-[250px] bg-white border-gray-200 border-4 text-center lg:p-5 p-1">
            <img src={product.imgLink} className="lg:h-[70%] h-[55%]"/>
            
            
            <div className="lg:h-1"/>
            <div className="flex flex-col items-center space-y-1">
              <text className="lg:text-2xl text-sm">{product.name}</text>
              <text className="lg:text-3xl text-md text-red-600">${product.price}</text>
              <div className="flex flex-row space-x-2">
                <label htmlFor={`quantity-${product.id}`} className="lg:text-2xl text-sm">購買數量:</label>
                <input
                    type="number"
                    id={`quantity-${product.id}`}
                    className="w-16 text-center border rounded"
                    defaultValue={1}
                    min={1}
                  />
                </div>
              <Button 
                className="bg-black text-white lg:h-10 h-6 lg:w-1/2 w-2/3"
                onClick={() => handleAddCart(product.id)}>
                <FontAwesomeIcon icon={faShoppingCart} className="lg:mr-2" />
                加入購物車
              </Button>
            </div>
          </div>
        ))}
      </div>
      <PaginationDemo
        totalItems={mapItems?.length != undefined?mapItems?.length:0}
        itemsPerPage={ITEM_PER_PAGE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
    </div>
  )
}