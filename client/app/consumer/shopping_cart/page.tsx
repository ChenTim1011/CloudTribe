import React, { useEffect, useState } from "react"
import { User, BasicProductInfo } from '@/services/interface'
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import NavigationBar from'@/components/NavigationBar'


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
  return(
    <div>
      <NavigationBar/>
      <Button className="w-1/5 lg:m-8 m-4">前往結帳</Button>
      <div className="grid lg:grid-cols-3 grid-cols-1 items-center">
        {data.map((d)=>
          <div key={d.name} className="flex flex-row w-full lg:h-[150px] h-[100px] items-center text-center space-x-2 p-4 lg:border-4">
            <div className="w-1/12">
              <Checkbox className="lg:h-6 lg:w-6"/>
            </div>
            <div className="w-3/12">
            <img src={d.url}/>
            </div> 
            <div className="flex flex-col w-5/12 text-center">
              <text className="lg:text-2xl line-clamp-2 text-pretty">{d.name}</text>
              <text className="lg:text-lg text-red-600">${d.price}</text>
              
            </div>
            <Input defaultValue={d.quantity} className="w-2/12 text-center"/>
            <Button variant="outline" className="bg-black text-white w-1/12">
              <FontAwesomeIcon icon={faTrashAlt} className="text-white"/>
            </Button>
          </div>

        )}
      </div>
      
    </div>

  )
}