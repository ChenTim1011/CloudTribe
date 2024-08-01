//not finish
import { User } from '@/services/interface'
class UserService {
  // Get user from local storage
  getLocalStorageUser = () => {
    try {
      var _user = localStorage.getItem('@user')
      var checkedUser = _user ? JSON.parse(_user) : { id: 'empty', name: 'empty', phone: 'empty' };  
    } catch (e) {
      console.log(e)
    }  
    return checkedUser
  }
  //Clear user from local storage when log out
  emptyLocalStorageUser = () => {
    try {
      localStorage.setItem('@user', JSON.stringify({ id: 'empty', name: 'empty', phone: 'empty' }))
    } catch (e) {
      console.log(e)
    }  
  }
}
export default new UserService()