"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import TimeCard from './TimeCard';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PlusIcon } from '@heroicons/react/outline';

// 可選時間範圍
const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

const DriverAvailableTimes: React.FC<{ driverId: number }> = ({ driverId }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [locations, setLocations] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<any[]>([]); // 存放時間卡片
  const [openSheet, setOpenSheet] = useState(false); // 控制 Sheet 開關
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // 成功訊息

  // 獲取已經存在的時間卡片
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await fetch(`/api/driver/${driverId}/times`);
        const data = await response.json();
        setTimeSlots(data);
      } catch (error) {
        console.error('Error fetching driver times:', error);
      }
    };

    fetchTimeSlots();
  }, [driverId]);

  // 添加新的時間段
  const handleAddTimeSlot = async () => {
    if (date && startTime && endTime && locations) {
      try {
        const response = await fetch(`/api/driver/time`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            driver_id: driverId,
            date: date.toISOString().split('T')[0], // 日期格式 YYYY-MM-DD
            start_time: startTime,
            end_time: endTime,
            locations,
          }),
        });
        const result = await response.json();
        setTimeSlots([...timeSlots, result]); // 更新時間卡片列表
        setSuccessMessage("時間新增成功！"); // 顯示成功訊息
        setTimeout(() => setSuccessMessage(null), 3000); // 成功訊息3秒後消失
      } catch (error) {
        console.error("Error adding time slot:", error);
      }
    }
  };

  // 刪除時間段
  const handleDeleteTimeSlot = async (id: number) => {
    try {
      await fetch(`/api/driver/time/${id}`, {
        method: 'DELETE',
      });
      setTimeSlots(timeSlots.filter(slot => slot.id !== id)); // 更新時間卡片列表
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  return (
    <div className="relative">
      {/* 新增時間的 + 大圓形按鈕 */}
      <div className="fixed bottom-10 right-10">
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild>
            <button className="rounded-full bg-blue-500 text-white p-4 shadow-lg" title="新增可用時間">
              <PlusIcon className="h-6 w-6" />
            </button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>新增可用時間</SheetTitle>
            </SheetHeader>

            <div className="mt-4">
              {/* 日期選擇 */}
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mt-2"
              />

              {/* 時間選擇 */}
              <div className="flex space-x-4 mt-4">
                <div>
                  <label className="block text-sm font-medium">開始時間</label>
                  <select
                    title="開始時間"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">選擇開始時間</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">結束時間</label>
                  <select
                    title="結束時間"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">選擇結束時間</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 地點輸入 */}
              <Input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="輸入地點"
                className="mt-4"
              />

              {/* 成功訊息 */}
              {successMessage && (
                <p className="mt-2 text-green-600">{successMessage}</p>
              )}

              {/* 新增按鈕 */}
              <Button className="mt-4 bg-blue-500 text-white" onClick={handleAddTimeSlot}>
                新增時間
              </Button>
            </div>

            {/* 新增的時間段列表 */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">新增的可用時間</h3>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map(slot => (
                    <TimeCard
                      key={slot.id}
                      timeSlot={slot}
                      onDelete={() => handleDeleteTimeSlot(slot.id)}
                    />
                  ))}
                </div>
              ) : (
                <p>尚無可用時間。</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default DriverAvailableTimes;
