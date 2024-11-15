import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeSlot } from '@/interfaces/driver/driver';

/**
 * Represents a card displaying the driver's available time slot.
 */
const TimeCard: React.FC<{ timeSlot: TimeSlot, onDelete: () => void }> = ({ timeSlot, onDelete }) => {
  const { driver_name, driver_phone, date, start_time, locations } = timeSlot;

  return (
    <Card className="max-w-md mx-auto my-4 shadow-lg">
      <CardHeader className="bg-black text-white p-4 rounded-t-md">
        <CardTitle className="text-lg font-bold">司機可用時間</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-sm font-bold">司機名稱: {driver_name}</p>
          <p className="text-sm">電話: {driver_phone}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm font-bold">日期: {date}</p>
          <p className="text-sm">開始時間: {start_time}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm font-bold">地點: {locations}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between">
        <Button className="bg-red-500 text-white" onClick={onDelete}>刪除</Button>
      </CardFooter>
    </Card>
  );
};

export default TimeCard;
