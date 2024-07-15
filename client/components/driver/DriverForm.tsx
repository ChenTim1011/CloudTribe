import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";

type DriverFormProps = {
    isOpen: boolean;
    onClose: () => void;
};

const DriverForm: React.FC<DriverFormProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [direction, setDirection] = useState<string | undefined>(undefined);
    const [date, setDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        // Clear previous errors
        setError("");

        // Validate the form fields
        if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(name)) {
            setError("姓名必須填寫而且只能包含中文或英文");
            return;
        }

        if (!/^\d{7,10}$/.test(phone)) {
            setError("電話號碼長度錯誤");
            return;
        }

        if (!direction) {
            setError("未選擇方向");
            return;
        }

        if (!date) {
            setError("未選擇日期");
            return;
        }

        if (!startTime) {
            setError("未選擇起始時間");
            return;
        }

        if (!endTime) {
            setError("未選擇結束時間");
            return;
        }

        if (endTime <= startTime) {
            setError("結束時間必須晚於起始時間");
            return;
        }

        const driverData = {
            name,
            phone,
            direction,
            available_date: date, // Already in YYYY-MM-DD format
            start_time: startTime,
            end_time: endTime,
        };

        try {
            const response = await fetch('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(driverData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit driver data');
            }

            console.log('Driver data submitted:', await response.json());

            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Error submitting driver data:', error);
            setError('提交司機資料時出錯');
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full max-w-3xl">
                <SheetHeader>
                    <SheetTitle>司機資料表</SheetTitle>
                    <SheetClose className="absolute top-2 right-2">
                        <FontAwesomeIcon icon={faTimes} />
                    </SheetClose>
                </SheetHeader>
                <div className="p-4">
                    {showAlert && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">提交成功!</strong>
                            <span className="block sm:inline">您的司機資料提交成功。</span>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="mb-4">
                        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入您的姓名" />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話" />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="direction" className="block text-sm font-medium text-gray-700">方向</Label>
                        <Select onValueChange={setDirection}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="選擇方向" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="山下往山上">山下往山上</SelectItem>
                                <SelectItem value="山上往山下">山上往山下</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="available_date" className="block text-sm font-medium text-gray-700">方便運送的日期</Label>
                        <Input
                            type="date"
                            id="available_date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="start_time" className="block text-sm font-medium text-gray-700">方便運送的起始時間</Label>
                        <Select onValueChange={setStartTime}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="選擇起始時間" />
                            </SelectTrigger>
                            <SelectContent>
                                {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="end_time" className="block text-sm font-medium text-gray-700">方便運送的結束時間</Label>
                        <Select onValueChange={setEndTime}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="選擇結束時間" />
                            </SelectTrigger>
                            <SelectContent>
                                {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
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

export default DriverForm;
