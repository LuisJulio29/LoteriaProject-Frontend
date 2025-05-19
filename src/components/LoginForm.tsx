import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import Spinner from './Spinner';
import loginImage from '../assets/images/loginFoto.webp';

export default function LoginForm() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(userName, password);
      if (response.isSuccess) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.roles.toString());
        toast.success('Inicio de Sesión Exitoso!');
        navigate('/tickets');
      } else {
        toast.error('Credenciales Incorrectas');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Inicio de sesión fallido');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex flex-col md:flex-row items-center justify-center p-4 md:p-0 transition-all duration-500 ease-in-out">
      <div className="w-full h-60 md:h-screen md:w-1/2 lg:w-2/3 xl:w-3/5 p-4 md:p-4 transform transition-all duration-500 ease-in-out md:hover:scale-105">
        <img
          src={loginImage}
          alt="Fantasy Login Background"
          className="object-cover w-full h-full rounded-3xl shadow-2xl"
        />
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-2/5 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md p-8 sm:p-10 md:p-12 rounded-3xl shadow-xl w-full max-w-md transform transition-all duration-500 ease-in-out hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-10 animate-fade-in-down">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-sky-600" />
                </div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="pl-10 pr-3 py-3 block w-full rounded-xl border-gray-300 shadow-md focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 ease-in-out focus:shadow-lg"
                  required
                  disabled={isLoading}
                  placeholder="Tu nombre de usuario"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-sky-600" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 block w-full rounded-xl border-gray-300 shadow-md focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 ease-in-out focus:shadow-lg"
                  required
                  disabled={isLoading}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-sky-600 transition-colors duration-300"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-sky-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-5 w-5 mr-3 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Acceder'
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes cuenta? <a className="font-medium text-sky-600 hover:text-sky-500 transition-colors duration-300">Comunicate con el administrador</a>
          </p>
        </div>
      </div>
    </div>
  );
}