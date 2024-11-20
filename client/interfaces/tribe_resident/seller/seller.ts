

export interface UploadItem {
    name: string
    price: string
    category: string
    total_quantity: string
    off_shelf_date: string
    img_link: string
    img_id: string
    seller_id: Number | null
  }
  export interface BasicProductInfo{
    id: Number
    name: string
    upload_date: string
    off_shelf_date: string
  }
  
  
  export interface CartItem {
    id: Number
    produce_id: Number
    name: string
    img_url: string
    price: Number
    quantity: Number
    seller_id: Number
  }


  export interface ProductInfo {
    id: Number
    name: string
    price: Number
    category: string
    total_quantity: Number
    upload_date: string
    off_shelf_date: string
    img_link: string
    img_id: string  
  }
  
  export interface ProductOrderInfo {
    order_id: Number
    buyer_name: string
    quantity: Number
    product_price: Number
    status: string
    timestamp: string
    is_put: boolean
  }
  
  export interface IsPutRequest {
    order_ids: Number[]
  }