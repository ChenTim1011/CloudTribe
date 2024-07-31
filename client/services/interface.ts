export interface User {
  id: string
  name: string
  phone: string 
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
    
