"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

type CheckoutFormProps = {
  onClose: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    console.log({
      name,
      phone,
      date,
      time,
      location,
    });
    // handle form submission
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>結帳資訊</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入您的姓名" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">電話</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">可以接受司機接單的最後日期(超過時間沒有司機接單就放棄)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={"w-full justify-start text-left font-normal"}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>選擇日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">可以接受司機接單的最後時間(超過時間沒有司機接單就放棄)</label>
            <Select onValueChange={setTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇時間" />
              </SelectTrigger>
              <SelectContent>
                {["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">領貨的地點</label>
            <Select onValueChange={setLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇地點" />
              </SelectTrigger>
              <SelectContent>
                {["飛鼠不渴露營農場", "樹不老休閒莊園", "戀戀雅渡農場"].map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button className="bg-black text-white" onClick={handleSubmit}>提交</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CheckoutForm;
