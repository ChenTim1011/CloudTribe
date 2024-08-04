class UserService {
  // Get user from local storage
  getLocalStorageUser = () => {
    try {
      var _user = localStorage.getItem('@user')
      var checkedUser = _user ? JSON.parse(_user) : { id: 0, name: 'empty', phone: 'empty', location:'empty' };  
    } catch (e) {
      console.log(e)
    }  
    return checkedUser
  }
  //Clear user from local storage when log out
  emptyLocalStorageUser = () => {
    try {
      localStorage.setItem('@user', JSON.stringify({ id: 0, name: 'empty', phone: 'empty', location:'empty' }))
    } catch (e) {
      console.log(e)
    }  
  }
  async update_nearest_location(userId: Number, location: string){
    const res = await fetch(`/api/users/location/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({location: location}),
    });
    const data = await res.json()
    if(!res.ok)
      throw new Error(`Error: ${data.detail}`)
    return data
  }
  async get_user(userId: Number){
    const res = await fetch(`/api/users/${userId}`,{
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
  async login(phone: string) {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json()
    if(!res.ok){
      if(data.detail.includes('404'))
        return "user not found" 
      else
        throw new Error(`Error: ${data.detail}`) 
    }
      
    return data
  }
}
export default new UserService()