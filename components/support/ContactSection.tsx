// components/support/ContactSection.tsx
import React, { FC } from 'react';
import { Mail, Phone } from 'lucide-react';

interface ContactOption {
  icon: React.ReactNode;
  title: string;
  contact: string;
  href: string;
  extraInfo?: string;
}

const ContactSection: FC = () => {
  const contactOptions: ContactOption[] = [
    {
      icon: <Mail className="h-6 w-6 text-sky-500 mr-3" />,
      title: 'Email Support',
      contact: 'support@connect-go.com',
      href: 'mailto:support@connect-go.com'
    },
    {
      icon: <Phone className="h-6 w-6 text-sky-500 mr-3" />,
      title: 'Phone Support',
      contact: '+1 (234) 567-890',
      href: 'tel:+1234567890',
      extraInfo: 'Mon-Fri, 9am-5pm EST'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-10">
      <h3 className="text-lg font-medium mb-4 text-stratosphere">Couldn't find what you're looking for?</h3>
      <p className="text-stratosphere/70 mb-6">Our support team is here to help. Reach out to us through any of these channels:</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {contactOptions.map((option, index) => (
          <div key={index} className="flex items-center p-4 bg-sky-tint rounded-md">
            {option.icon}
            <div>
              <h4 className="font-medium text-stratosphere">{option.title}</h4>
              <a href={option.href} className="text-sky-500 hover:underline">
                {option.contact}
              </a>
              {option.extraInfo && (
                <p className="text-sm text-stratosphere/70">{option.extraInfo}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactSection;