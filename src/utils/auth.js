export const saveToken = (token) =>
  localStorage.setItem('auth_token', token);

export const getToken = () =>
  localStorage.getItem('auth_token');

export const logout = () =>
  localStorage.removeItem('auth_token');

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};