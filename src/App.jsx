import React, { useState } from 'react';
import Login from '../src/components/Login';
import Home from '../src/components/Home';


function App() {
  // Persist login in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('admin_isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_isLoggedIn');
  };

  return (
    <>
      {isLoggedIn ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
