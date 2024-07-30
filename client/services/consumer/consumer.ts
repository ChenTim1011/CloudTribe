import { AddCartRequest } from '@/services/interface'
class ConsumerService{
  async get_on_sell_product(today_date: string){
    const res = await fetch(`/api/consumer/on_sell/${today_date}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      if(res.status!=200){  
        console.log("get on sell items error, status: ", res.status)
        console.log(res.json())
        return "get on sell items error"
      }
      const data = await res.json()
      return data
  }
  async add_shopping_cart(req: AddCartRequest){
    const res = await fetch('/api/consumer/cart',{
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
        return "add item to shopping cart error" 
    }
    
    return data
  }
}
export default new ConsumerService()