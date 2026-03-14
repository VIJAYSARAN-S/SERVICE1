export const auth = {
  setToken: (token: string) => localStorage.setItem('token', token),
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setRole: (role: string) => localStorage.setItem('role', role),
  getRole: () => typeof window !== 'undefined' ? localStorage.getItem('role') : null,
  setEmail: (email: string) => localStorage.setItem('email', email),
  getEmail: () => typeof window !== 'undefined' ? localStorage.getItem('email') : null,
  setUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    window.location.href = '/';
  },
  isAuthenticated: () => {
    return !!(typeof window !== 'undefined' && localStorage.getItem('token'));
  }
};
