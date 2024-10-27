export interface User {
  id: Number
  name: string
  phone: string 
  location: string
  is_driver: boolean
}

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


export interface AddCartRequest {
  buyer_id: Number
  produce_id: Number
  quantity: Number
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
export interface PurchasedProductRequest{
  seller_id: Number
  buyer_id: Number
  buyer_name: string
  produce_id: Number
  quantity: Number
  starting_point: string
  end_point: string
  category: string //agriculture or necessity
}
export interface PurchasedProduct{
  order_id: Number
  quantity: Number
  timestamp: string
  product_name: string
  product_price: Number
  img_url: string
  status: string //未接單or已接單or已送達
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
}
    
 
    
