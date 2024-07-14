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
  const [quantity, setQuantity] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Reset the error message
    setError("");

    // Validate the name
    if (!name) {
      setError("商品名稱不能是空的");
      return;
    }

    // Validate the quantity
    if (Number(quantity) <= 0 || !quantity) {
      setError("數量必須大於零");
      return;
    }

    // Validate the price
    if (Number(price) <= 0 || !price) {
      setError("價格必須大於零");
      return;
    }

    // All validations passed
    addToCart({ name, quantity: Number(quantity), price: Number(price), img: "/will.jpg" });
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
            <label className="mb-5 block text-sm font-medium text-gray-700">商品名稱(品牌/名稱/大小)</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入商品名稱" />
          </div>
          <div className="mb-10">
            <label className="mb-5 block text-sm font-medium text-gray-700">購買數量</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              placeholder="輸入購買數量"
            />
          </div>
          <div className="mb-10">
            <label className="mb-5 block text-sm font-medium text-gray-700">購買價格</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={1}
              placeholder="輸入購買價格"
            />
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
