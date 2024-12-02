"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TimeSlot } from '@/interfaces/driver/driver';
import TimeCard from './TimeCard';
import { useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";

const libraries: LoadScriptProps['libraries'] = ["places"];

const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

// Custom hook for debouncing input values
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Format prediction description
const formatPredictionDisplay = (prediction: google.maps.places.AutocompletePrediction) => {
  const businessName = prediction.structured_formatting.main_text;
  const address = prediction.structured_formatting.secondary_text;

  return {
    businessName: businessName || '',
    address: address || ''
  };
};

const DriverAvailableTimes: React.FC<{ driverId: number }> = ({ driverId }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]); 
  const [openSheet, setOpenSheet] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const [error, setError] = useState<string | null>(null);

  // Initialize debounced search term
  const debouncedSearchTerm = useDebounce(searchInput, 1000);

  // Service references for Google Places API
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW'
  });

  // Initialize Google Places services
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  // Fetch predictions when search term changes
  useEffect(() => {
    if (debouncedSearchTerm && autocompleteService.current) {
      const searchQuery = {
        input: debouncedSearchTerm,
        language: 'zh-TW',
        componentRestrictions: { country: 'tw' },
        types: ['establishment']
      };

      autocompleteService.current.getPlacePredictions(
        searchQuery,
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  }, [debouncedSearchTerm]);

  // Handle place selection
  const handlePlaceSelect = (placeId: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'name']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const fullAddress = `${place.name} ${place.formatted_address}`;
            setLocation(fullAddress);
            setSearchInput(fullAddress);
            setPredictions([]);
            setError(null);
          } else {
            setError("無法獲取地點詳細資訊");
          }
        }
      );
    }
  };

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (!value) {
      setPredictions([]);
    }
  };

  // to fetch the time slots for the driver
  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/times`);
      const data = await response.json();
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching driver times:', error);
    }
  };

  const handleSheetOpen = () => {
    setOpenSheet(true); 
    fetchTimeSlots(); 
  };

  // add a new time slot
  const handleAddTimeSlot = async () => {
    setError(null);
    
    if (!date) {
      setError("請選擇日期。");
      return;
    }
  
    if (!startTime) {
      setError("請選擇開始時間。");
      return;
    }
  
    const now = new Date();
    
    const [hours, minutes] = startTime.split(':');
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (selectedDateTime < now) {
      setError("請選擇未來的時間。");
      return;
    }
    
    if (!location) {
      setError("請選擇地點。");
      return;
    }
  
    try {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(`/api/drivers/time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driver_id: driverId,
          date: formattedDate,
          start_time: startTime,
          locations: location,
        }),
      });
      
      const result = await response.json();
      setTimeSlots((prevTimeSlots) => {
        if (Array.isArray(prevTimeSlots)) {
          return [...prevTimeSlots, result];
        } else {
          return [result];
        }
      });

      await fetchTimeSlots();
      
      setSuccessMessage("時間新增成功！");
      setTimeout(() => setSuccessMessage(null), 1000);
    } catch (error) {
      console.error("Error adding time slot:", error);
      setError("新增時間失敗，請稍後再試。");
    }
  };

  // delete a time slot
  const handleDeleteTimeSlot = async (id: number) => {
    try {
      await fetch(`/api/drivers/time/${id}`, {
        method: 'DELETE',
      });
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  if (loadError) {
    return <div>地圖載入失敗</div>;
  }

  if (!isLoaded) {
    return <div>載入中...</div>;
  }

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
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mt-2"
            />

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
                
            <div className="mt-5 relative">
              <label className="block text-sm font-medium text-gray-700">地點</label>
              <div className="relative">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={handleInputChange}
                  placeholder="搜尋地點"
                  className="w-full"
                />
                {predictions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                    {predictions.map((prediction) => {
                      const { businessName, address } = formatPredictionDisplay(prediction);
                      return (
                        <div
                          key={prediction.place_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handlePlaceSelect(prediction.place_id)}
                        >
                          <div className="font-medium text-gray-900">{businessName}</div>
                          <div className="text-sm text-gray-500">{address}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {location && (
                <div className="mt-2 text-sm text-gray-600">
                  選擇的地點: {location}
                </div>
              )}
            </div>

            {error && (
              <p className="mt-2 text-red-600">{error}</p>
            )}

            {successMessage && (
              <p className="mt-2 text-green-600">{successMessage}</p>
            )}
              
            <Button 
              className="mt-5 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white" 
              onClick={handleAddTimeSlot}
            >
              新增時間
            </Button>
          </div>

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