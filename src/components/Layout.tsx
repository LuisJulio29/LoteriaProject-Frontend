import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TicketIcon, BarChart2, Sparkles, Menu, User, LogOut, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InfoModal from './InfoModal'; // Importamos el componente que acabamos de crear
import { Register } from '../services/api';

const navigationItems = [
  { path: '/tickets', icon: TicketIcon, label: 'Tickets' },
  { path: '/loterias', icon: TicketIcon, label: 'Loterias' },
  { path: '/patrones', icon: BarChart2, label: 'Patrones' },
  { path: '/Sorteopatron', icon: BarChart2, label: 'Patron Loteria' },
  { path: '/astro', icon: Sparkles, label: 'Astro' },
];

interface NavItemProps {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ path, icon: Icon, label, isActive }) => (
  <Link
    to={path}
    className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
      isActive
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="h-5 w-5 mr-2" />
    {label}
  </Link>
);

interface MobileNavItemProps {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ path, icon: Icon, label, isActive, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center px-4 py-3 text-sm ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    <Icon className="h-5 w-5 mr-3" />
    {label}
  </Link>
);

interface UserMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
  setIsRegisterOpen: (isOpen: boolean) => void;
  isRegisterOpen: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isMobile = false, onItemClick = () => {}, setIsRegisterOpen }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario es administrador
    const role = localStorage.getItem('role');
    setIsAdmin(role === '0');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Redirigir al login o a la página principal
    navigate('/');
    toast.success('Sesión cerrada correctamente');
    onItemClick();
  };

  const handleAddUser = () => {
    // Solo cerramos el sidebar después de que se abra el modal
    setIsRegisterOpen(true);
    // Eliminamos la llamada a onItemClick aquí para evitar cerrar el sidebar
    // inmediatamente. El sidebar se cerrará más tarde
  };

  // Renderizar versión móvil (dentro del sidebar)
  if (isMobile) {
    return (
      <div className="px-4 py-2 mt-2 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-500 mb-2">Usuario</p>
        {isAdmin && (
          <button 
            onClick={handleAddUser}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserPlus className="h-5 w-5 mr-3" />
            Añadir Usuario
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Renderizar versión desktop (dropdown)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <User className="h-6 w-6 text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAdmin && (
          <DropdownMenuItem onClick={() => setIsRegisterOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Añadir Usuario</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para cerrar el sidebar cuando se abre el modal
  useEffect(() => {
    if (isRegisterOpen) {
      setIsOpen(false);
    }
  }, [isRegisterOpen]);

  const handleRegister = async () => {
    if (!userName || !password) {
      toast.error("Por favor ingrese usuario y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      await Register(userName, password);
      toast.success("Usuario creado correctamente");
      setIsRegisterOpen(false);
      setUserName("");
      setPassword("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("No se pudo crear el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                 <SheetContent side="left" className="w-[240px] p-0">
                  <div className="py-4">
                    {/* Opciones de navegación */}
                    {navigationItems.map((item) => (
                      <MobileNavItem
                        key={item.path}
                        {...item}
                        isActive={location.pathname === item.path}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                    <div className="flex items-center w-full px-2 text-sm text-gray-700 hover:bg-gray-50">       
                      <InfoModal />
                    </div>
                    <UserMenu 
                      isMobile={true} 
                      onItemClick={() => setIsOpen(false)} 
                      setIsRegisterOpen={setIsRegisterOpen}
                      isRegisterOpen={isRegisterOpen}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:space-x-2">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
            <div className="hidden md:flex md:items-center md:space-x-2">
              <InfoModal />
              <UserMenu 
                setIsRegisterOpen={setIsRegisterOpen} 
                isRegisterOpen={isRegisterOpen}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de registro (centralizado) */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir nuevo usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ingrese el nombre de usuario"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}