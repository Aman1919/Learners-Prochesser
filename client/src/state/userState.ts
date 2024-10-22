import { atom, selector } from 'recoil';
import axios from 'axios';
import { BACKEND_URL } from '../constant';

interface packag{
  name: string;
}

interface Subscription {
  id: number;
  package: packag 
  startDate: string;
  endDate?: string; 
  isActive: boolean;
}

interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  Subscription?:Subscription[]; 
}

// Atom to store user data
export const userState = atom<User | null>({
  key: 'userState',
  default: null,
});

// Selector to fetch user data (without managing loading state)
export const fetchUserState = selector<User | null>({
  key: 'fetchUserState',
  get: async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const response = await axios.get<User>(`${BACKEND_URL}/api/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  },
});

// Atom to track the loading state
export const isLoadingState = atom<boolean>({
  key: 'isLoadingState',
  default: false,
});
