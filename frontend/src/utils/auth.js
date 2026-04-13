import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role; // This matches the 'role' we put in the JWT on the backend
  } catch (err) {
    return null;
  }
};