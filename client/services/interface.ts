export interface User {
  id: string
  name: string
  phone: string 
  location: string
};
export interface UploadItem {
  name: string
  price: string
  category: string
  totalQuantity: string
  offShelfDate: string
  imgLink: string
  imgId: string
  sellerId: string | null
}
export interface BasicProductInfo{
  id: Number
  name: string
  uploadDate: string
  offShelfDate: string
}

export interface ProductInfo extends UploadItem {
  id: Number
  uploadDate: string
}
export interface AddCartRequest {
  buyerId: string
  produceId: Number
  quantity: Number
}
export interface CartItem {
  id: Number
  name: string
  imgUrl: string
  price: Number
  quantity: Number
}
 
    
