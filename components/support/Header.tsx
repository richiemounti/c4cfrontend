// components/support/Header.tsx
import { FC } from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  toggleMenu: () => void;
}

const Header: FC<HeaderProps> = ({ toggleMenu }) => {
  return (
    <header className="bg-white py-4 px-6 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <button 
          className="p-2 md:hidden" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-stratosphere" />
        </button>
        
        <div className="text-center flex-1 md:text-left">
          <h1 className="text-lg font-medium text-stratosphere">C4C PLATFORM HELP PAGE</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;