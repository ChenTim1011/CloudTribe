import { DriverOrder } from '@/interfaces/driver/driver';

class DriverService{

        handle_accept_order = async(service: string, order_id: Number, req: DriverOrder) =>{
        
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
  export default new DriverService()