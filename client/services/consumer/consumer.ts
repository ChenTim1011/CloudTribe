import { AddCartRequest, PurchasedProductRequest } from '@/interfaces/consumer/consumer';
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
      if(data.detail.includes('409'))
        return "shopping cart has already had this item"  
      else
        throw new Error(`Error: ${data.detail}`)
    }
    return data
  }
  async get_shopping_cart_items(userId: Number){
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
  async delete_shopping_cart_item(itemId: Number){
    const res = await fetch(`/api/consumer/cart/${itemId}`,{
        method: 'DELETE',
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
  async update_shopping_cart_quantity(itemId: Number, quantity: Number){
    const res = await fetch(`/api/consumer/cart/quantity/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({quantity}),
    });
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
  async add_product_order(req: PurchasedProductRequest){
    const res = await fetch('/api/consumer/order',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(req)
    })
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
  async update_shopping_cart_status(itemId: Number){
    const res = await fetch(`/api/consumer/cart/status/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
  async get_purchased_items(userId: Number){
    const res = await fetch(`/api/consumer/purchased/${userId}`,{
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
  async update_order_status_to_confirmed(orderId: Number){
    const res = await fetch(`/api/consumer/order/status_confirm/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
}
export default new ConsumerService()