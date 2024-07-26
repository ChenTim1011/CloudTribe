
'use client'
import React, { useState, useEffect } from "react";
import { User, Product } from '@/services/interface'
import CartModal from "@/components/buyer/CartModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import NavigationBar from "@/components/NavigationBar";



const allItems =[
  {
    id: "i1",
    name:'水蜜桃',
    url: "fruit1.jpg"
  },
  {
    id: "i2",
    name:'萵苣',
    url: "vegetable1.jpg"
  },
  {
    id: "i3",
    name:'高麗菜',
    url: "vegetable2.jpg"
  },
  {
    id: "i4",
    name:'萵苣',
    url: "vegetable1.jpg"
  },
  {
    id: "i5",
    name:'水蜜桃',
    url: "fruit1.jpg"
  },
  {
    id: "i6",
    name:'高麗菜',
    url: "vegetable2.jpg"
  },
  {
    id: "i7",
    name:'高麗菜',
    url: "vegetable2.jpg"
  },
  {
    id: "i8",
    name:'萵苣',
    url: "vegetable1.jpg"
  },
  {
    id: "i9",
    name:'水蜜桃',
    url: "fruit1.jpg"
  },
  
]
const categories =[
  {
    id: "c1",
    content: "蔬菜"
  },
  {
    id: "c2",
    content: "水果"
  },
  {
    id: "c3",
    content: "雞蛋"
  },
  {
    id: "c4",
    content: "豆類"
  },
  {
    id: "c5",
    content: "稻米"
  },
  {
    id: "c6",
    content: "醃漬食品"
  },
  {
    id: "c7",
    content: "罐頭食品"
  },
  {
    id: "c8",
    content: "乳製品"
  },
  {
    id: "c9",
    content: "調味料"
  },
]


export default function Page() {
  const [user, setUser] = useState<User>()
  const [isCartOpen, setIsCartOpen] = useState(false);
  //const [cart, setCart] = useState<CartItem[]>([]);

  //run every render
  useEffect(() => {
    getUser()
  },[]);

  const getUser = () => {
    try {
      var _user = localStorage.getItem('@user')
      var checkedUser = _user ? JSON.parse(_user) : { id: null, name: '', phone: '' };
      setUser(checkedUser)
    } catch (e) {
      console.log(e)
    }  
  }
  /*
  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
      )
    );
  };*/

  return (
    <div className="h-full w-full bg-gray-200">
      <NavigationBar /> 
      <header className="flex flex-col w-full bg-lime-800 lg:h-[300px] h-[150px] text-center items-center shadow-2xl sticky top-0 z-50">
        <p className="lg:text-5xl text-3xl font-bold tracking-wides lg:py-[50px] py-[20px] text-neutral-50">農產品列表</p>
        <div className="flex lg:w-1/2 w-3/4 items-center space-x-2 ">
          <Input type="email" placeholder="請輸入農產品名稱" className="lg:text-2xl text-md bg-white lg:h-[60px] h-[30px] border-white border-4 rounded" />
          <Button variant="outline" className="text-black text-lg text-center bg-white lg:h-[60px] h-[30px] lg:w-[80px] w-[50px] border-white border-4 rounded">搜尋</Button>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="lg:text-lg text-sm text-center bg-white lg:h-[60px] h-[30px] lg:w-[80px] w-[60px] border-white border-4 rounded">進階搜尋</Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full lg:max-w-6xl bg-white lg:h-[350px]">
                <DrawerHeader>
                  <DrawerTitle className="text-center lg:text-4xl text-2xl">請勾選要查詢的項目</DrawerTitle>
                  <DrawerDescription>
                    
                    <div className="flex w-full mt-4">
                      <div className="lg:w-1/6 w-1/12"></div>
                      <div className="lg:w-2/3 w-10/12 justify-center grid grid-cols-3">
                        {categories.map((category) => (  
                          <div className="flex items-center lg:space-x-2 space-x-[1px] lg:text-2xl text-xl">
                            <Checkbox id="term1"></Checkbox>
                            <label>{category.content}</label>
                          </div>
                        ))}
                        </div>
                      <div className="lg:w-1/6 w-1/12"></div>
                    </div>

                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button className="text-xl">提交</Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="text-xl">取消</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>
      <div className="grid lg:grid-cols-3 grid-cols-2 items-center lg:p-28 px-2 py-5">
        {allItems.map((item) => (  
          <div className="w-full lg:h-[500px] h-[220px] bg-white border-gray-200 border-4 text-center lg:p-5 p-1">
            <img id={item.id} src={item.url} className="w-full lg:h-[80%] h-[70%]"></img>
            <div className="lg:h-1"/>
            <div className="flex flex-col items-center">
              <text className="lg:text-2xl text-sm">{item.name}</text>
              <text className="lg:text-2xl text-sm text-nlack">價格:$10</text>
              <Button className="bg-black text-white lg:h-10 h-6 lg:w-1/2 w-2/3">
                <FontAwesomeIcon icon={faShoppingCart} className="lg:mr-2" />
                加入購物車
              </Button>
            </div>

          </div>
         
        ))}
      </div>
      <div>
      {user ? (
        <div>
          <h1>User Info</h1>
          <p>Name: {user.name}</p>
          <p>Email: {user.phone}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      </div>
    </div>
  )
}