import { DriverOrder } from '@/interfaces/driver/driver';
class DriverService {
    async handle_accept_order(service: string, order_id: Number, req: DriverOrder){
        
        const res = await fetch(`/api/orders/${service}/${order_id}/accept`,{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body:JSON.stringify(req)
        })
        const data = await res.json()
        if(!res.ok)
          throw new Error(`Error: ${data.detail}`)
        return data
    }   
}

// juiting version

import { Driver } from '@/interfaces/driver/driver';
import { Order } from '@/interfaces/tribe_resident/buyer/order';

/**
 * Fetch driver data based on user ID.
 * @param userId - The user's ID.
 * @returns The driver data or null if not found.
 */
export const fetchDriverData = async (userId: number): Promise<Driver | null> => {
    try {
        const response = await fetch(`/api/drivers/user/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn("使用者尚未成為司機");
                return null;
            } else {
                throw new Error('Failed to fetch driver data');
            }
        }
        const data: Driver = await response.json();
        console.log('Fetched driver data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching driver data:', error);
        throw error;
    }
};


/**
 * Accept an order.
 * @param orderId - The ID of the order to accept.
 * @param driverId - The driver's ID.
 * @returns A success message.
 */
export const acceptOrder = async (orderId: string, driverId: number): Promise<void> => {
    try {
        console.log("Accepting order with orderId:", orderId);
        const timestamp = new Date().toISOString();

        const response = await fetch(`/api/orders/${orderId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driver_id: driverId,
                order_id: orderId,
                action: "接單",
                timestamp: timestamp,
                previous_driver_id: null,
                previous_driver_name: null,
                previous_driver_phone: null
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to accept order: ${errorText}`);
        }

        alert('接單成功');
    } catch (error) {
        console.error('Error accepting order:', error);
        alert('接單失敗');
        throw error;
    }
};

/**
 * Fetch unaccepted orders with optional date filters.
 * @param filterStartDate - The start date filter.
 * @param filterEndDate - The end date filter.
 * @returns An array of unaccepted orders.
 */
export const fetchUnacceptedOrders = async (
    filterStartDate: Date | null,
    filterEndDate: Date | null
): Promise<Order[]> => {
    try {
        const response = await fetch(`/api/orders`);
        if (!response.ok) {
            throw new Error('Failed to fetch unaccepted orders');
        }

        let data: Order[] = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching unaccepted orders:', error);
        throw error;
    }
};

/**
 * Fetch orders assigned to a specific driver.
 * @param driverId - The driver's ID.
 * @returns An array of accepted orders.
 */
export const fetchDriverOrders = async (driverId: number): Promise<Order[]> => {
    try {
        const response = await fetch(`/api/drivers/${driverId}/orders`);
        if (!response.ok) {
            throw new Error('Failed to fetch driver orders');
        }
        const data: Order[] = await response.json();
        console.log('Fetched driver orders:', data);
        return data;
    } catch (error) {
        console.error('Error fetching driver orders:', error);
        throw error;
    }
};



/**
 * Transfer an order to a new driver.
 * @param orderId - The ID of the order to transfer.
 * @param currentDriverId - The current driver's ID.
 * @param newDriverPhone - The phone number of the new driver.
 * @returns A success message.
 */
export const transferOrder = async (
    orderId: string,
    currentDriverId: number,
    newDriverPhone: string
): Promise<void> => {
    try {
        const response = await fetch(`/api/orders/${orderId}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_driver_id: currentDriverId,
                new_driver_phone: newDriverPhone
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to transfer order: ${errorText}`);
        }

        alert('轉單成功，重整頁面可看到更新結果');
    } catch (error) {
        console.error('Error transferring order:', error);
        alert('轉單失敗');
        throw error;
    }
};

/**
 * Complete an order.
 * @param orderId - The ID of the order to complete.
 * @returns A success message.
 */
export const completeOrder = async (orderId: string): Promise<void> => {
    try {
        const response = await fetch(`/api/orders/${orderId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to complete order');
        }

        alert('訂單已完成');
    } catch (error) {
        console.error('Error completing order:', error);
        alert('完成訂單失敗');
        throw error;
    }
};


export default new DriverService()
