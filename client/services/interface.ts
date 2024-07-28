export interface User {
  id: string
  name: string
  phone: string 
};
export interface UploadItem{
  name: string
  price: string
  category: string
  totalQuantity: string
  offShelfDate: string
  imgLink: string
  imgId: string
  ownerPhone: string | null
}
export interface BasicProductInfo{
  id: string
  name: string
  onShelfDate: string
  offShelfDate: string
}
    
