export interface User {
  id: string
  name: string
  phone: string 
  location: string
}
export interface UploadItem {
  name: string
  price: string
  category: string
  total_quantity: string
  off_shelf_date: string
  img_link: string
  img_id: string
  seller_id: string | null
}
export interface BasicProductInfo{
  id: Number
  name: string
  upload_date: string
  off_shelf_date: string
}

export interface ProductInfo extends UploadItem {
  id: Number
  upload_date: string
}
export interface AddCartRequest {
  buyer_id: string
  produce_id: Number
  quantity: Number
}
export interface CartItem {
  id: Number
  name: string
  img_url: string
  price: Number
  quantity: Number
}
export interface PurchaseProductRequest{
  seller_id: Number
  buyer_id: Number
  buyer_name: string
  produce_id: Number
  quantity: Number
  starting_point: string
  end_point: string
  category: string //agriculture or necessity
}
 
    
