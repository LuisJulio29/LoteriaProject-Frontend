import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import TicketList from './components/TicketList';
import PatronesPage from './pages/PatronesPage';
import AstroPage from './pages/AstroPage';
import SorteoList from './components/SorteoList';
import SorteoParonesPage from './pages/SorteoPatronesPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" />;
}

function LoginRedirect() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (token) {
      navigate('/tickets');
    }
  }, [token, navigate]);
  return <LoginForm />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LoginRedirect />} />
        <Route
          path="/tickets"
          element={
            <PrivateRoute>
              <Layout>
                <TicketList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/loterias"
          element={
            <PrivateRoute>
              <Layout>
                <SorteoList/>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patrones"
          element={
            <PrivateRoute>
              <Layout>
                <PatronesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Sorteopatron"
          element={
            <PrivateRoute>
              <Layout>
                <SorteoParonesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/astro"
          element={
            <PrivateRoute>
              <Layout>
                <AstroPage />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;