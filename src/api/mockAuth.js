const USERS_KEY = 'mock_users';

const getUsers = () =>
  JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const registerApi = async (data) => {
  await new Promise(r => setTimeout(r, 800)); // simulate delay

  const users = getUsers();
  if (users.find(u => u.email === data.email)) {
    throw new Error('Email already registered');
  }

  users.push(data);
  saveUsers(users);
  return { success: true };
};

export const loginApi = async ({ email, password }) => {
  await new Promise(r => setTimeout(r, 600));

//   const users = getUsers();
//   const user = users.find(
//     u => u.email === email && u.password === password
//   );

//   if (!user) {
//     throw new Error('Invalid credentials');
//   }

  return {
    token: btoa(`${email}:${Date.now()}`),
    user: { name: email, email: email }
  };
};
