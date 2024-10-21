"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import TimeCard from './TimeCard';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface TimeSlot {
  id: number;
  driver_name: string;
  driver_phone: string;
  date: string;
  start_time: string;
  locations: string;
}

// use `timeOptions` to populate the select dropdown for start time
const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

const DriverAvailableTimes: React.FC<{ driverId: number }> = ({ driverId }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [locations, setLocations] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]); // 存放時間卡片
  const [openSheet, setOpenSheet] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // 成功訊息
 

   // to fetch the time slots for the driver
   const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/times`);
      const data = await response.json();
      console.log("Fetched time slots:", data);
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching driver times:', error);
    }
  };

    // read the time slots when the component mounts
    const handleSheetOpen = () => {
      setOpenSheet(true); 
      fetchTimeSlots(); 
    };


  // add a new time slot
  const handleAddTimeSlot = async () => {
    if (date && startTime  && locations) {
      try {
        const response = await fetch(`/api/drivers/time`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            driver_id: driverId,
            date: date.toISOString().split('T')[0], 
            start_time: startTime,
            locations,
          }),
        });
        const result = await response.json();
       
        // ensure that the timeSlots state is an array
        setTimeSlots((prevTimeSlots) => {
          if (Array.isArray(prevTimeSlots)) {
            return [...prevTimeSlots, result];
          } else {
            return [result]; // if not an array, return the single result
          }
        });
          
        setSuccessMessage("時間新增成功！"); 
        
        setTimeout(() => setSuccessMessage(null), 3000); // after 3 seconds, remove the success message
      } catch (error) {
        console.error("Error adding time slot:", error);
      }
    }
  };

  // delete a time slot
  const handleDeleteTimeSlot = async (id: number) => {
    try {
      await fetch(`/api/drivers/time/${id}`, {
        method: 'DELETE',
      });
      setTimeSlots(timeSlots.filter(slot => slot.id !== id)); // update the timeSlots state
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  return (
    <div>
        <Button 
          className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
          onClick={handleSheetOpen}
        >
        新增時間
        </Button>

        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>新增可用時間</SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            {/* choose date */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mt-2"
            />

            {/* choose start time */}
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
            </div>
                
            {/* input locations */}
            <Input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="輸入地點"
              className="mt-5"
            />

            {successMessage && (
              <p className="mt-2 text-green-600">{successMessage}</p>
            )}
              
            {/* add time slot button */}
            <Button  className="mt-5 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white" onClick={handleAddTimeSlot}>
              新增時間
            </Button>
          </div>
          {/* show the available time slots*/}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">目前可用的時間</h3>
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
  );
};


export default DriverAvailableTimes;
