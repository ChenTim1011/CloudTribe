class SellerService {
  async upload_image(img: string){
    const res = await fetch('/api/sellers/upload_image',{
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ img:img }),
    })
    if(res.status!=200){
        console.log("getUserInfo: error, status: ", res.status)
        console.log(res.json())
        return "upload photo error"
    }
    const data = await res.json()
    return data
 }
}
export default new SellerService()