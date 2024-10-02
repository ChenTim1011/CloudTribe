class UserService {
  // Get user from local storage
  getLocalStorageUser = () => {
    try {
      var _user = localStorage.getItem('@user')
      var checkedUser = _user ? JSON.parse(_user) : { id: 0, name: 'empty', phone: 'empty', location:'empty' 
        , is_driver: false 
      };  
    } catch (e) {
      console.log(e)
    }  
    return checkedUser
  }

  // Store user to local storage
  setLocalStorageUser = (user: any) => {
    try {
      localStorage.setItem('@user', JSON.stringify(user));
    } catch (e) {
      console.log(e);
    }
  };

  //Clear user from local storage when log out
  emptyLocalStorageUser = () => {
    try {
      localStorage.setItem('@user', JSON.stringify({ id: 0, name: 'empty', phone: 'empty', location:'empty'
        , is_driver: false
      }))
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

    // Store user data to local storage
    const userData = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      location: data.location,
      is_driver: data.is_driver || false,  
    };
    this.setLocalStorageUser(userData); 
    return data
  }
  async register(name: string, phone: string){
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json()
    if(!res.ok){
      if(data.detail.includes('409'))
        return "phone exists" 
      else
        throw new Error(`Error: ${data.detail}`) 
    } 

  }
}
export default new UserService()