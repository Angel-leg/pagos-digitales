import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLogin } from './AuthService';

const AuthCallback = () => {
  const navigate = useNavigate();

    useEffect(() => {
    completeLogin()
      .then(user => {
        console.log('Usuario completado:', user);
        if (user && user.access_token) {
          localStorage.setItem('access_token', user.access_token);
          navigate('/pagos');
        } else {
          console.error('No se recibió access_token en el usuario');
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Error en login:', err);
        navigate('/');
      });
  }, [navigate]);

  return <p>Procesando inicio de sesión...</p>;
};

export default AuthCallback;
