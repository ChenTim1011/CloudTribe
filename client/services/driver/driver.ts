import { DriverOrder } from '@/services/interface'
class DriverService {
    async handle_accept_order(order_id:Number, req: DriverOrder){
        
        const res = await fetch(`/api/orders/${order_id}/accept`,{
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
