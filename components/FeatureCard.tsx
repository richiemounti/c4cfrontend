// components/FeatureCard.tsx
import { FC } from 'react';
import { Users, TrendingUp, FileText, BarChart3 } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  id: number;
}

const FeatureCard: FC<FeatureCardProps> = ({ title, id }) => {
  // Map feature IDs to appropriate icons
  const getIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Users className="h-12 w-12 text-white mb-6" />;
      case 2:
        return <TrendingUp className="h-12 w-12 text-white mb-6" />;
      case 3:
        return <FileText className="h-12 w-12 text-white mb-6" />;
      case 4:
        return <BarChart3 className="h-12 w-12 text-white mb-6" />;
      default:
        return <Users className="h-12 w-12 text-white mb-6" />;
    }
  };

  return (
    <div className="bg-sky/70 p-8 rounded-lg flex flex-col justify-center items-center text-center h-full min-h-[280px]">
      {getIcon(id)}
      <h3 className="text-lg font-semibold text-white leading-relaxed">
        {title}
      </h3>
    </div>
  );
};

export default FeatureCard;