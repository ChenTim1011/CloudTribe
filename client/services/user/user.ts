class UserService {
  // Get user from local storage
  getLocalStorageUser = () => {
    let checkedUser = { id: 0, name: 'empty', phone: 'empty', location: 'empty', is_driver: false };
    if (typeof window !== 'undefined') {
      try {
        const _user = localStorage.getItem('@user');
        if (_user) {
          const parsedUser = JSON.parse(_user);
          parsedUser.is_driver = parsedUser.is_driver === true || parsedUser.is_driver === 'true';
          checkedUser = parsedUser;
        }
      } catch (e) {
        console.error('Error reading user from local storage:', e);
      }
    }
    return checkedUser;
  };

  // Store user to local storage
  setLocalStorageUser = (user: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('@user', JSON.stringify(user));
        const event = new Event('userDataChanged');
        window.dispatchEvent(event);
      } catch (e) {
        console.error('Error saving user to local storage:', e);
      }
    }
  };

  // Clear user from local storage when log out
  emptyLocalStorageUser = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('@user', JSON.stringify({
          id: 0, name: 'empty', phone: 'empty', location: 'empty', is_driver: false
        }));
        const event = new Event('userDataChanged');
        window.dispatchEvent(event);
      } catch (e) {
        console.error('Error clearing user from local storage:', e);
      }
    }
  };

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
    const event = new Event('userDataChanged');
    window.dispatchEvent(event);
    return data
  }
  async register(name: string, phone: string, location: string, is_driver: boolean) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone, location, is_driver }),
    });
    const data = await res.json()
    if(!res.ok){
      if(data.detail.includes('409'))
        return "phone exists" 
      else
        throw new Error(`Error: ${data.detail}`) 
    } 
  }
  async bindLineAccount(userId: number, lineUserId: string){
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/bind-line`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_id: userId,
                  line_user_id: lineUserId
              })
          });

          if (!response.ok) {
              const error = await response.json();
              throw new Error(error.detail);
          }

          return await response.json();
      } catch (error) {
          console.error('Error binding LINE account:', error);
          throw error;
      } 
  }
}

export default new UserService()
