export type AddItemFormProps = {
    onClose: () => void;
    addToCart: (item: { name: string; quantity: number; price: number; img: string; location?: string }) => void; // 添加 location 屬性（可選）
  };
  