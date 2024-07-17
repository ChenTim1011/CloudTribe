import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from "@/components/ui/button";

const NavigationPage: React.FC = () => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [orderData, setOrderData] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<any>(null);
    const [eta, setEta] = useState<string>('');
    const [distance, setDistance] = useState<string>('');

    useEffect(() => {
        if (orderId) {
            fetchOrderData(orderId);
        }
    }, [orderId]);

    const fetchOrderData = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order data');
            }
            const data = await response.json();
            setOrderData(data);
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    };

    const getDriverLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setDriverLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                calculateRoute(position.coords.latitude, position.coords.longitude);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const calculateRoute = async (lat: number, lng: number) => {
        if (!orderData || !orderData.location) return;

        const origin = `${lat},${lng}`;
        const destination = orderData.location;

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyAqTDoe1DMWu5sCEsPSVyLPvzUnrLXOj20`
        );
        const data = await response.json();

        if (data.routes.length > 0) {
            const route = data.routes[0];
            const leg = route.legs[0];
            setEta(leg.duration.text);
            setDistance(leg.distance.text);
        } else {
            console.error('No routes found');
        }
    };

    useEffect(() => {
        if (driverLocation && orderData) {
            initMap();
        }
    }, [driverLocation, orderData]);

    const initMap = async () => {
        const loader = new Loader({
            apiKey: 'AIzaSyAqTDoe1DMWu5sCEsPSVyLPvzUnrLXOj20',
            version: 'weekly',
        });

        const google = await loader.load();
        const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: driverLocation,
            zoom: 12,
        });

        const marker = new google.maps.Marker({
            position: driverLocation,
            map: map,
            title: "Driver Location",
        });

        const destinationMarker = new google.maps.Marker({
            position: {
                lat: parseFloat(orderData.location.split(',')[0]),
                lng: parseFloat(orderData.location.split(',')[1]),
            },
            map: map,
            title: "Destination",
        });

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);

        const request = {
            origin: driverLocation,
            destination: {
                lat: parseFloat(orderData.location.split(',')[0]),
                lng: parseFloat(orderData.location.split(',')[1]),
            },
            travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
            } else {
                console.error(`Error fetching directions ${result}`);
            }
        });
    };

    if (!orderData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">導航到顧客</h1>
            <div className="mb-4">
                <p className="text-lg font-bold">消費者姓名: {orderData.name}</p>
                <p className="text-lg">電話: {orderData.phone}</p>
                <p className="text-lg">地點: {orderData.location}</p>
                <p className="text-lg">總價格: ${orderData.total_price}</p>
                <p className="text-lg">最晚可接單日期: {orderData.date}</p>
                <p className="text-lg">最晚可接單時間: {orderData.time}</p>
                <ul className="list-disc list-inside ml-4">
                    {orderData.items.map((item: any) => (
                        <li key={item.item_id} className="text-lg">
                            {item.name} - {item.quantity} x ${item.price}
                        </li>
                    ))}
                </ul>
            </div>
            <Button className="bg-black text-white" onClick={getDriverLocation}>抓取司機目前的位置</Button>
            {driverLocation && (
                <div className="mt-4">
                    <p className="text-lg">預計抵達時間: {eta}</p>
                    <p className="text-lg">距離: {distance}</p>
                    <div id="map" style={{ height: '400px', width: '100%' }}></div>
                </div>
            )}
        </div>
    );
};

export default NavigationPage;
