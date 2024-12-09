import { DriverOrder } from '@/interfaces/driver/driver';

class DriverService{
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
    async get_all_driver_times(){
      const res = await fetch('/api/drivers/all/times',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      
      if(!res.ok)
        throw new Error(`Error: ${data.detail}`)
      return data
    }
    async get_specific_driver_times(driver_id: Number){
      const res = await fetch(`/api/drivers/${driver_id}/times`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      
      if(!res.ok)
        throw new Error(`Error: ${data.detail}`)
      return data
    }
  }
  export default new DriverService()