// components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-stratosphere py-6 border-t border-stratosphere">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Image 
              src="/levelnewlogo.PNG" 
              alt="LEVEL" 
              width={80} 
              height={20}
            />
          </div>
          
          <div className="text-sm text-white/80">
            Copyright © 2025 ConnectGo
          </div>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-sm text-white/80 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-white/80 hover:text-white">
              Privacy Policy
            </Link>
            <span className="text-sm text-white/80">
              powered by @connectgo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;