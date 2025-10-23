import React from 'react';
import { login } from '../auth/AuthService';

const Login = () => (
  <div style={{ padding: 20 }}>
    <h2>Bienvenido al sistema</h2>
    <button onClick={login}>Iniciar sesión con Cognito</button>
  </div>
);

export default Login;
