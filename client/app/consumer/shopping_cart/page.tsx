'use client'
import React, { useEffect, useState } from "react"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import NavigationBar from'@/components/NavigationBar'
import ConsumerService from '@/services/consumer/consumer'
import UserService from '@/services/user/user'
import { User, CartItem } from '@/services/interface'
import { useRouter } from 'next/navigation'


const data=[
  {
    url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOFJh23mawfpZ6O_k255jSwXBz9mNXdjrWw&s",
    name:'超極好吃的蔬菜水果',
    price:'100',
    quantity:'5'
  },
  {
    url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOFJh23mawfpZ6O_k255jSwXBz9mNXdjrWw&s",
    name:'超好吃的蔬菜水果',
    price:'100',
    quantity:'5'
  },
  {
    url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOFJh23mawfpZ6O_k255jSwXBz9mNXdjrWw&s",
    name:'超好吃的蔬菜水果',
    price:'100',
    quantity:'5'
  },
  {
    url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOFJh23mawfpZ6O_k255jSwXBz9mNXdjrWw&s",
    name:'超好吃的蔬菜水果',
    price:'100',
    quantity:'5'
  },
  {
    url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOFJh23mawfpZ6O_k255jSwXBz9mNXdjrWw&s",
    name:'超好吃的蔬菜水果',
    price:'100',
    quantity:'5'
  }
]
export default function ShoppingCart(){
  const [user, setUser] = useState<User>()
  const [cart, setCart] = useState<CartItem[]>([])
  const router = useRouter()
  useEffect(()=>{
    const _user = UserService.getLocalStorageUser()
    if(_user == null){
      router.replace('/login')
    }   
    setUser(_user)
    get_shopping_cart_items(_user.id.toString())
  }, [])
  
  const get_shopping_cart_items = async(userId: string) => {
    try{
      const cart_items:CartItem[] = await ConsumerService.get_shopping_cart_items(userId)
      setCart(cart_items)
    }
    catch(e){
      console.log(e)
    }

  }
  return(
    <div>
      <NavigationBar/>
      <Button className="w-1/5 lg:m-8 m-4">前往結帳</Button>
      <div className="grid lg:grid-cols-3 grid-cols-1 items-center">
        {cart.map((item)=>
          <div key={item.id.toString()} className="flex flex-row w-full lg:h-[150px] h-[100px] items-center text-center space-x-2 p-4 lg:border-4">
            <div className="w-1/12">
              <Checkbox className="lg:h-6 lg:w-6"/>
            </div>
            <div className="w-3/12">
            <img src={item.imgUrl}/>
            </div> 
            <div className="flex flex-col w-5/12 text-center">
              <text className="lg:text-2xl line-clamp-2 text-pretty">{item.name}</text>
              <text className="lg:text-lg text-red-600">${item.price.toString()}</text>
              
            </div>
            <Input defaultValue={item.quantity.toString()} className="w-2/12 text-center"/>
            <Button variant="outline" className="bg-black text-white w-1/12">
              <FontAwesomeIcon icon={faTrashAlt} className="text-white"/>
            </Button>
          </div>

        )}
      </div>
      
    </div>

  )
}