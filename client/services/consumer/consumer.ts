class ConsumerService{
  async get_on_sell_product(today_date: string){
    const res = await fetch(`/api/consumer/on_sell/${today_date}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      if(res.status!=200){
        console.log("get on sell items error, status: ", res.status)
        console.log(res.json())
        return "get on sell items error"
      }
      const data = await res.json()
      return data
  }
    

}
export default new ConsumerService()