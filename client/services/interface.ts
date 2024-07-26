export interface User {
  id: string
  name: string
  phone: string 
};
/*
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
};*/

export interface Product {
  category: string
  img: string
  id: string
  name: string
  price: number 
};
export interface UploadItem{
  name: string
  price: string
  category: string
  offShelfDate: string
  imgLink: string
  imgId: string
  ownerPhone: string | null

}
    
