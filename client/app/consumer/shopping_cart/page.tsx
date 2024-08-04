'use client'
import React, { useEffect, useState } from "react"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { NavigationBar } from'@/components/NavigationBar'
import ConsumerService from '@/services/consumer/consumer'
import UserService from '@/services/user/user'
import { User, CartItem, PurchaseProductRequest } from '@/services/interface'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { MutableRequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export default function ShoppingCart(){
  const [user, setUser] = useState<User>()
  const [cart, setCart] = useState<CartItem[]>([])
  const [changedQuantity, setChangedQuantity] = useState([])
  const [check, setCheck] = useState<string[]>([])
  const [message, setMessage] = useState('empty')
  const router = useRouter()

  useEffect(()=>{
    const _user = UserService.getLocalStorageUser()
    if(_user.name == 'empty'){
      router.replace('/login')
    }   
    setUser(_user)
    setChangedQuantity([])
    get_shopping_cart_items(_user.id)
  }, [])
  
  const get_shopping_cart_items = async(userId: Number) => {
    try{
      const cart_items:CartItem[] = await ConsumerService.get_shopping_cart_items(userId)
      setCart(cart_items)
    }
    catch(e){
      console.log(e)
    }
  }
  const handleDeleteButton = (itemId: Number) => {
    try {
      const res = ConsumerService.delete_shopping_cart_item(itemId)
      setCart(cart.filter((item) => item.id != itemId))
    }
    catch(e){
      console.log(e)
    } 

  }
  const handleQuantityInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setChangedQuantity({...changedQuantity, [event.target.id.split('-')[1]]:event.target.value})
  }
  
  const storeChangedQuantity = async() => {
    for(var key in changedQuantity){
      try{
        const res = await ConsumerService.update_shopping_cart_quantity(parseInt(key), changedQuantity[key])
      }
      catch(e){
        console.log(e)
      }  
    }  
  }
  const handlePurchaseButton = async() =>{
    if(check.length == 0){
      setMessage('請勾選商品')
      setTimeout(() => setMessage('empty'), 2000)
    }
    else if(user?.location=='未選擇'){
      setMessage('請先至右上角的設定來填寫個人資料')
      setTimeout(() => setMessage('empty'), 3500)
    }
    else{
      storeChangedQuantity()
      check.map(async(checkedItemId)=> {
        let item = cart.find((item) => item.id.toString() == checkedItemId)
        if(item != undefined && user != undefined){
          try{
            const res_seller = await UserService.get_user(item?.seller_id)
            let req: PurchaseProductRequest = {
              seller_id: item?.seller_id,
              buyer_id: user?.id,
              buyer_name: user?.name,
              produce_id: item?.produce_id,
              quantity: item?.quantity,
              starting_point: res_seller.location,
              end_point: user?.location,
              category: 'agriculture'
            }
            const res_order = await ConsumerService.add_product_order(req) 
            const res_cart_status = await ConsumerService.update_shopping_cart_status(item?.id)

            //未完成:
            //回到購買商品頁面
          }
          catch(e){
            console.log(e)
          }
        }
      })
      setMessage('成功訂購商品')
      setTimeout(() => setMessage('empty'), 2000)
    }
  }
  const handleCheckBox: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const target = event.target as HTMLButtonElement
    const id = target.id.split('-')[1]
    if(check.includes(id))
      setCheck(check.filter((element) => element != id))
    else
      check.push(id)
  }
  return(
    <div>
      <NavigationBar/>
      {message != 'empty' && 
      <Alert className="bg-yellow-300 text-black w-fit text-center">
        <AlertDescription className="lg:text-lg text-md">
          {message}
        </AlertDescription>
      </Alert>}
      <div className="flex flex-row justify-between">
        <Button className="w-fit lg:m-8 m-4 px-4" onClick={storeChangedQuantity}>
          <Link href="/consumer">
            返回商品頁面
          </Link>
        </Button>
        
        
        <Button className="w-fit lg:m-8 m-4 px-4" onClick={handlePurchaseButton}>購買勾選商品</Button>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-1 items-center">
        {cart.map((item)=>
          <div key={item.id.toString()} className="flex flex-row w-full lg:h-[150px] h-[100px] items-center text-center space-x-2 p-4 lg:border-4">
            <div className="w-1/12">
              <Checkbox 
                id={`check-${item.id}`} 
                className="lg:h-6 lg:w-6"
                onClick={handleCheckBox}/>
            </div>
            <div className="w-3/12">
              <img src={item.img_url} className="lg:h-[150px] h-[100px] w-full py-2"/>
            </div> 
            <div className="flex flex-col w-5/12 text-center">
              <p className="lg:text-2xl line-clamp-2 text-pretty">{item.name}</p>
              <p className="lg:text-lg text-red-600">${item.price.toString()}</p>
              
            </div>
            <Input
              type="number" 
              id={`quantity-${item.id}`}
              className="w-2/12 text-center lg:h-8 lg:text-lg"
              defaultValue={item.quantity.toString()} 
              onChange={handleQuantityInput}
              min={1}/>
            <Button 
              variant="outline" 
              id={`delete-${item.id}`}
              className="bg-black text-white w-1/12"
              onClick={() => handleDeleteButton(item.id)}>
              <FontAwesomeIcon icon={faTrashAlt} className="text-white"/>
            </Button>
          </div>

        )}
      </div>
      
    </div>

  )
}