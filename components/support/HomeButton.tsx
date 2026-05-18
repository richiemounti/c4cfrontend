// components/support/HomeButton.tsx
import { FC } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

const HomeButton: FC = () => {
  return (
    <div className="container mx-auto px-6 py-4 flex justify-end">
      <Link href="/" className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow">
        <Home className="h-5 w-5 text-sky-500" />
      </Link>
    </div>
  );
};

export default HomeButton;