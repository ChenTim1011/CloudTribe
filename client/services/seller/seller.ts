import { UploadItem } from '@/services/interface'

class SellerService {
  async upload_image(img: string){
    const res = await fetch('/api/seller/upload_image',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ img:img }),
    })
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
 }
  async upload_item(req: UploadItem){
    const res = await fetch('/api/seller/',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
    })
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }

  async get_upload_product(sellerId: Number){
    const res = await fetch(`/api/seller/${sellerId}`,{
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
  async get_product_info(productId: Number){
    const res = await fetch(`/api/seller/product/${productId}`,{
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
  
}
export default new SellerService()