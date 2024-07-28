import { UploadItem } from '@/services/interface'

class SellerService {
  async upload_image(img: string){
    const res = await fetch('/api/sellers/upload_image',{
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ img:img }),
    })
    if(res.status!=200){
        console.log("upload photo error, status: ", res.status)
        console.log(res.json())
        return "upload photo error"
    }
    const data = await res.json()
    return data
 }
  async upload_item(req: UploadItem){
    const res = await fetch('/api/sellers/',{
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
    })
    if(res.status!=200){
        console.log("upload items error, status: ", res.status)
        console.log(res.json())
        return "upload items error"
    }
    const data = await res.json()
    return data
  }

  async get_upload_product(phone: string){
    const res = await fetch(`/api/sellers/${phone}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      if(res.status!=200){
          console.log("get upload items error, status: ", res.status)
          console.log(res.json())
          return "get upload items error"
      }
      const data = await res.json()
      return data
  }
  async get_on_shelf_product(today_date: string){
    const res = await fetch(`/api/sellers/${today_date}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      if(res.status!=200){
          console.log("get on shelf items error, status: ", res.status)
          console.log(res.json())
          return "get on shelf items error"
      }
      const data = await res.json()
      return data
  }
  
}
export default new SellerService()