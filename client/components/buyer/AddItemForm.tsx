"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

type AddItemFormProps = {
  onClose: () => void;
  addToCart: (item: { name: string; quantity: number; price: number; img: string }) => void;
};

const AddItemForm: React.FC<AddItemFormProps> = ({ onClose, addToCart }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name || quantity <= 0 || price <= 0) {
      setError("請填寫所有欄位且確保數量和價格大於零。");
      return;
    }
    addToCart({ name, quantity, price, img: "/will.jpg" }); 
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>如果找不到，想要買的東西</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {error && <div className="text-red-500 mb-10">{error}</div>}
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700">商品名稱(品牌/名稱/大小)</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入商品名稱" />
          </div>
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700">購買數量</label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} />
          </div>
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700">購買價格</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={1} />
          </div>
        </div>
        <SheetFooter>
          <Button className="bg-black text-white" onClick={handleSubmit}>加入購物車</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddItemForm;
