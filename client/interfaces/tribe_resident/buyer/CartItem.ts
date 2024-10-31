import { Product } from './Product';

export type CartItem = Product & {
  quantity: number;
  location?: string; // 添加 location 屬性（可選）
};
