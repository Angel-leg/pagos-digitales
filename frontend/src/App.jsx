import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import PaymentForm from './pages/PaymentForm';
import AuthCallback from './auth/AuthCallback';
import PrivateRoute from './auth/PrivateRoute';
import NotFound from './pages/NotFound';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/pagos"
        element={
          <PrivateRoute>
            <PaymentForm />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;
