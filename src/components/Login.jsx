import React, { useState } from 'react';
import './Login.css';
import toast, { Toaster } from 'react-hot-toast';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // For Vite, use import.meta.env
    const validUser = import.meta.env.VITE_ADMIN_USERNAME;
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (username === validUser && password === validPass) {
      onLogin();
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-center" reverseOrder={false} />
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;