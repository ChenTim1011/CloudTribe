class UserService {
  // Get user from local storage
  getLocalStorageUser = () => {
    try {
      var _user = localStorage.getItem('@user')
      var checkedUser = _user ? JSON.parse(_user) : { id: 'empty', name: 'empty', phone: 'empty', location:'empty' };  
    } catch (e) {
      console.log(e)
    }  
    return checkedUser
  }
  //Clear user from local storage when log out
  emptyLocalStorageUser = () => {
    try {
      localStorage.setItem('@user', JSON.stringify({ id: 'empty', name: 'empty', phone: 'empty', location:'empty' }))
    } catch (e) {
      console.log(e)
    }  
  }
  async update_nearest_location(userId: string, location: string){
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
}
export default new UserService()