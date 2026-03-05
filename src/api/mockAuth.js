const USERS_KEY = 'mock_users';

const getUsers = () =>
  JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const registerApi = async (data) => {
  try {
    const response = await fetch('http://54.79.79.106:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the object containing name, email, age, and password
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        age: data.age,
        password: data.password
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // This catches the errors handled by your Python status codes
      // e.g., if you return status=400 for 'Email already registered'
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  } catch (error) {
    throw error;
  }
};

export const loginApi = async ({ email, password }) => {
  try {
    const response = await fetch('http://54.79.79.106:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass email and password as a JSON object
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Throws error if Python returns status codes like 401 or 404
      throw new Error(result.message || 'Invalid credentials');
    }

    //Returns the token and user details to your frontend state
    return {
      token: result.token,
      token_type: result.token_type,
      // Since your API currently only returns the token, 
      // we use the email to fill the user name locally
      user: { name: email.split('@')[0], email: email }
    };
    // return {
    //   token: "tokenjbdfgvbdvbjhbvbvb",
    //   token_type: "Bearer",
    //   // Since your API currently only returns the token, 
    //   // we use the email to fill the user name locally
    //   user: { name: email.split('@')[0], email: email }
    // };
  } catch (error) {
    throw error;
  }
};
