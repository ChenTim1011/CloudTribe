

export interface Driver {
    id: number;
    user_id: number;
    driver_name: string;
    driver_phone: string;
    direction?: string;
    available_date?: string; // ISO format date, e.g. '2024-05-01'
    start_time?: string; // ISO format time, e.g. '09:00'
    end_time?: string; // ISO format time, e.g. '09:00'
}

export interface DriverOrder {
    driver_id: number;
    order_id: number;
    action: string;
    timestamp?: string; // ISO format date, e.g. '2024-05-01'
    previous_driver_id?: number;
    previous_driver_name?: string;
    previous_driver_phone?: string;
    service: string;
}


export interface TimeSlot {
    id: number;
    driver_name: string;
    driver_phone: string;
    date: string;
    start_time: string;
    locations: string;
  }

  export interface DriverTime {
    driver_id: number;
    date: string; // ISO format date, e.g. '2024-05-01'
    start_time: string; // ISO formate time, e.g. '09:00'
    locations: string;
}

export interface DriverTimeDetail {
    id: number
    date: string // ISO format date, e.g. '2024-05-01'
    start_time: string // ISO formate time, e.g. '09:00'
    locations: string
    driver_name: string
    driver_phone: string
}



