"use client";

import React, { useEffect, useState, useCallback, useMemo , useRef } from 'react';
import OrderCard from '@/components/driver/OrderCard';
import { useRouter } from 'next/navigation';
import { Order } from '@/interfaces/tribe_resident/buyer/order';
import { Driver } from '@/interfaces/driver/driver';
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

interface DriverOrdersPageProps {
    driverData: Driver;
    onAccept: (orderId: string, service: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onNavigate: (orderId: string) => void;
    onComplete: (orderId: string, service: string) => Promise<void>;
}

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

  const formatPredictionDisplay = (prediction: google.maps.places.AutocompletePrediction) => {
    const businessName = prediction.structured_formatting.main_text;
    const address = prediction.structured_formatting.secondary_text;
  
    return {
      businessName: businessName || '',
      address: address || ''
    };
  };


/**
 * Represents the page component for displaying driver orders.
 * @param {Object} props - The component props.
 * @param {Driver} props.driverData - The driver data.
 * @returns {JSX.Element} - The driver orders page component.
 */
const DriverOrdersPage: React.FC<DriverOrdersPageProps> = ({ 
    driverData, 
    onAccept, 
    onTransfer, 
    onComplete 
}) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();
    const [orderStatus, setOrderStatus] = useState<string>("接單");
    const [error, setError] = useState<string>("");

    const [searchInput, setSearchInput] = useState<string>("");
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [finalDestination, setFinalDestination] = useState<{
        name: string;
        location: { lat: number; lng: number };
    } | null>(null);
    
    const [isManualInput, setIsManualInput] = useState(true);
    const debouncedSearchTerm = useDebounce(searchInput, 800);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    useEffect(() => {
        // Only fetch predictions if it's a manual input
        if (isManualInput && debouncedSearchTerm && debouncedSearchTerm.length >= 2 && autocompleteService.current) {
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
    }, [debouncedSearchTerm, isManualInput]);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).google) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
            const mapDiv = document.createElement('div');
            const map = new google.maps.Map(mapDiv);
            placesService.current = new google.maps.places.PlacesService(map);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        setIsManualInput(true);
        if (!value) {
            setPredictions([]); 
        }
    };

    const handlePlaceSelect = (placeId: string) => {
        if (placesService.current) {
            placesService.current.getDetails(
                {
                    placeId: placeId,
                    fields: ['formatted_address', 'name', 'geometry']
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        const fullLocation = `${place.name} ${place.formatted_address}`;
                        setSearchInput(fullLocation);
                        setIsManualInput(false);
                        
                        if (place.geometry?.location) {
                            setFinalDestination({
                                name: fullLocation,
                                location: {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng()
                                }
                            });
                        }
                        
                        setPredictions([]);
                        setError("");
                    } else {
                        setError("無法獲取地點詳細資訊");
                    }
                }
            );
        }
    };


    // Handle navigation to the navigation page
    const handleNavigate = () => {
        if (!finalDestination) {
            setError("請先設定最終目的地");
            return;
        }

        // Get all locations 
        const allLocations = new Set<string>();
        
        orders.forEach(order => {
            if (order.order_status === "接單") {
                // Add order location
                if (order.location) {
                    allLocations.add(order.location);
                }
                // Add all item locations
                order.items.forEach(item => {
                    if (item.location) {
                        allLocations.add(item.location);
                    }
                });
            }
        });

        // Navigate to the navigation page
        router.push(`/navigation?driverId=${driverData.id}&finalDestination=${encodeURIComponent(JSON.stringify(finalDestination))}&waypoints=${encodeURIComponent(JSON.stringify(Array.from(allLocations)))}`);
    };


    /**
     * Fetches the orders assigned to the driver from the server.
     */
    const fetchDriverOrders = useCallback(async () => {
        try {
            const response = await fetch(`/api/drivers/${driverData.id}/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch driver orders');
            }
            const data: Order[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching driver orders:', error);
            setError('獲取訂單失敗');
        }
    }, [driverData.id]);

    /**
     * Fetch orders when the component mounts or driverData changes.
     */
    useEffect(() => {
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }

        fetchDriverOrders();
    }, [driverData, fetchDriverOrders]);

    // Handle local transfer of order
    const handleLocalTransfer = async (orderId: string, newDriverPhone: string) => {
        try {
            // Call the transfer API
            await onTransfer(orderId, newDriverPhone);
            // Update the local state
            setOrders(prevOrders => prevOrders.filter(order => order.id !== parseInt(orderId)));
        } catch (error) {
            console.error('Error in handleLocalTransfer:', error);
            setError('轉單失敗');
        }
    };

    // Handle local complete of order
    const handleLocalComplete = async (orderId: string, service: string) => {
        try {
            // Call the complete API
            await onComplete(orderId, service);
            // Update the local state
            setOrders(prevOrders => prevOrders.filter(order => order.id !== parseInt(orderId)));
        } catch (error) {
            console.error('Error in handleLocalComplete:', error);
            setError('完成訂單失敗');
        }
    };



    const finalFilteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = order.order_status === orderStatus;
            return matchesStatus;
        });
    }, [orders, orderStatus]);

    /**
     * Calculates the total price of the filtered orders.
     */
    const totalPrice = finalFilteredOrders.reduce((total, order) => total + order.total_price, 0);

    /**
     * Aggregates all items from the filtered orders, categorized by location.
     */
    const aggregatedItemsByLocation = useMemo(() => {
        const locationMap: { [location: string]: { [itemName: string]: number } } = {};

        finalFilteredOrders.forEach(order => {
            order.items.forEach(item => {
                const location = item.location || "未指定地點"; 
                if (!locationMap[location]) {
                    locationMap[location] = {};
                }
                if (locationMap[location][item.item_name]) {
                    locationMap[location][item.item_name] += item.quantity;
                } else {
                    locationMap[location][item.item_name] = item.quantity;
                }
            });
        });

        // Convert the locationMap object to an array of objects
        const result: { location: string; items: { name: string; quantity: number }[] }[] = [];
        for (const [location, items] of Object.entries(locationMap)) {
            const itemList = Object.entries(items).map(([name, quantity]) => ({ name, quantity }));
            result.push({ location, items: itemList });
        }

        return result;
    }, [finalFilteredOrders]);

    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">設定最終目的地</h2>
                <div className="relative">
                    <Input
                        type="text"
                        value={searchInput}
                        onChange={handleInputChange}
                        placeholder="輸入最終目的地"
                        className="w-full mb-2"
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
                                        <div className="font-medium">{businessName}</div>
                                        <div className="text-sm text-gray-500">{address}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <Button 
                    onClick={handleNavigate}
                    className="w-full bg-black text-white"
                    disabled={!finalDestination}
                >
                    開始導航
                </Button>
                {error && (
                    <Alert variant="destructive" className="mt-2">
                        {error}
                    </Alert>
                )}
            </div>

            <h1 className="text-lg text-center font-bold mb-4">只有找到下一位司機才可以轉單</h1>

            {/* Filter controls for order status and date range */}
            <div className="mb-4">
                {/* Order status buttons */}
                <div className="flex justify-center space-x-2 mb-2">
                    <Button
                        variant={orderStatus === "接單" ? "default" : "outline"}
                        onClick={() => setOrderStatus("接單")}
                    >
                        接單
                    </Button>
                    <Button
                        variant={orderStatus === "已完成" ? "default" : "outline"}
                        onClick={() => setOrderStatus("已完成")}
                    >
                        已完成
                    </Button>
                </div>

              
             
            </div>

            {/* Aggregated Items Button and Popover */}
            <div className="flex overflow-auto justify-center mb-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary">
                            統計所有需要購買的物品
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4 overflow-auto max-h-80">
                        {aggregatedItemsByLocation.length > 0 ? (
                            <div>
                                <h2 className="text-md font-semibold mb-4">需要購買的物品清單 (按地點分類)</h2>
                                {aggregatedItemsByLocation.map((locationGroup, index) => (
                                    <div key={index} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2">{locationGroup.location}</h3>
                                        <table className="w-full table-auto mb-2">
                                            <thead>
                                                <tr>
                                                    <th className="text-left border-b pb-1">物品名稱</th>
                                                    <th className="text-right border-b pb-1">數量</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {locationGroup.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-1">{item.name}</td>
                                                        <td className="text-right py-1">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>目前沒有需要購買的物品。</p>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Display total price if there are filtered orders */}
            {finalFilteredOrders.length > 0 && (
                <div className="flex justify-center mb-4">
                    <span className="text-lg font-bold">總價格: {totalPrice.toFixed(2)} 元</span>
                </div>
            )}

            {/* Display error message if any */}
            {error && <div className="text-red-600 text-center mb-4">{error}</div>}

            {/* Display the list of orders */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {finalFilteredOrders.length > 0 ? (
                    finalFilteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            driverId={driverData.id}
                            onAccept={async (orderId: string) => {
                                console.log(`Order ${orderId} accepted`);
                                await onAccept(orderId, order.service);
                            }}
                            onTransfer={(orderId: string, newDriverPhone: string) => handleLocalTransfer(orderId, newDriverPhone)}
                            onComplete={(orderId: string) => handleLocalComplete(orderId, order.service)}
                        />
                    ))
                ) : (
                    <p className="text-center mt-8">目前沒有接到的訂單。</p>
                )}
            </div>
        </div>
    );
};

export default DriverOrdersPage;
