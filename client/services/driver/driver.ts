import { DriverOrder } from '@/services/interface'
class DriverService {
    async handle_accept_order(req: DriverOrder){
        
        const res = await fetch(`/api/orders/accept`,{
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
