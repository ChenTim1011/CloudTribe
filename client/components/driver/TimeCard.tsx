import React from 'react';
import { Button } from "@/components/ui/button";

/**
 * Represents a card displaying the driver's available time slot.
 */
const TimeCard: React.FC<{ timeSlot: any, onDelete: () => void }> = ({ timeSlot, onDelete }) => {
  const { date, start_time, end_time, locations } = timeSlot;

  return (
    <div className="border border-gray-300 p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <p className="font-semibold">日期: {date}</p>
        <p>開始時間: {start_time}</p>
        <p>結束時間: {end_time}</p>
        <p>地點: {locations}</p>
      </div>
      <Button className="bg-red-500 text-white" onClick={onDelete}>刪除</Button>
    </div>
  );
};

export default TimeCard;
