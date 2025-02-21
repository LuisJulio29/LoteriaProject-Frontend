import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TicketIcon, BarChart2, Sparkles, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

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
                    {navigationItems.map((item) => (
                      <MobileNavItem
                        key={item.path}
                        {...item}
                        isActive={location.pathname === item.path}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}