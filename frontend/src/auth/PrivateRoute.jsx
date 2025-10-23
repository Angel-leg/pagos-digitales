import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import userManager from './AuthService';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    userManager.getUser().then(user => {
      console.log('Usuario en PrivateRoute:', user);
      setIsAuthenticated(!!user && !user.expired);
    });
  }, []);

  if (isAuthenticated === null) {
    return <p>Validando sesión...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
