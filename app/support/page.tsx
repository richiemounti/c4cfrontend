// app/support/page.tsx
'use client';

import { useState } from 'react';
import Footer from '../../components/Footer';

// Import our components
import Header from '../../components/support/Header';
import NavigationTabs from '../../components/support/NavigationTabs';
import MobileMenu from '../../components/support/MobileMenu';
import HomeButton from '../../components/support/HomeButton';
import SearchBar from '../../components/support/SearchBar';
import HelpTopicsSection from '../../components/support/HelpTopicsSection';
import ContactSection from '../../components/support/ContactSection';

const SupportPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality here
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-tint">
      {/* Header */}
      <Header toggleMenu={toggleMenu} />

      {/* Navigation Tabs */}
      <NavigationTabs activeTab="help" />
      
      {/* Home Button */}
      <HomeButton />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-stratosphere">HOW CAN WE HELP YOU?</h2>
          
          {/* Search Bar */}
          <div className="mb-10">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {/* Help Topics Section */}
          <HelpTopicsSection />
          
          {/* Contact Section */}
          <ContactSection />
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default SupportPage;