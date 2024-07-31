import { AddCartRequest } from '@/services/interface'
class ConsumerService{
  async get_on_sell_product(){
    const res = await fetch('/api/consumer',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()
    
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
  async add_shopping_cart(req: AddCartRequest){
    const res = await fetch('/api/consumer/cart',{///cart
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(req)
    })
    const data = await res.json()
    if(!res.ok){
      //console.log("res_status:", data.detail)
      if(data.detail.includes('409'))
        return "shopping cart has already had this item"  
      else
        throw new Error(`Error: ${data.detail}`)
    }
    return data
  }
  async get_shopping_cart_items(userId: string){
    const res = await fetch(`/api/consumer/cart/${userId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await res.json()
    if(!res.ok){
      throw new Error(`Error: ${data.detail}`)
    }
    return data
  }
}
export default new ConsumerService()