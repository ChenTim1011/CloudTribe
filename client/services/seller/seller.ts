import { UploadItem, IsPutRequest } from '@/interfaces/tribe_resident/seller/seller';

class SellerService {
  async upload_image(img: string) {
    const res = await fetch('/api/seller/upload_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ img }),
    });
    if (!res.ok) {
      let errorMessage = 'Unknown error';
      try {
        const data = await res.json();
        errorMessage = data.detail || `HTTP ${res.status} error`;
      } catch (e) {
        errorMessage = await res.text(); // 處理非 JSON 回應
      }
      throw new Error(`Error: ${errorMessage}`);
    }
    const data = await res.json();
    return data;
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
  async get_product_order(productId: Number){
    const res = await fetch(`/api/seller/product/order/${productId}`,{
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
  async check_is_put(req: IsPutRequest){
    const res = await fetch('/api/seller/agricultural_product/is_put',{
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
  async delete_agri_product(productId: Number){
    const res = await fetch(`/api/seller/${productId}`,{
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
  async update_offshelf_date(productId: Number, date: string){
    const res = await fetch(`/api/seller/product/offshelf_date/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({date: date}),
    });
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
}
export default new SellerService()