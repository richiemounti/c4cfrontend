// components/reports/ReportTypeIcon.tsx
'use client';

import { 
  Settings, MapPin, Users, Target, AlertTriangle,
  FileText
} from 'lucide-react';
import { ReportType } from '@/types/reports';

interface ReportTypeIconProps {
  type: ReportType;
  size?: number;
  className?: string;
}

const ReportTypeIcon: React.FC<ReportTypeIconProps> = ({
  type,
  size = 20,
  className = ''
}) => {
  const iconProps = {
    size,
    className: `${className} flex-shrink-0`
  };

  const iconMap: Record<ReportType, React.ReactNode> = {
    'project_setup': (
      <Settings {...iconProps} className={`${iconProps.className} text-stratosphere`} />
    ),
    'project_site_setup': (
      <MapPin {...iconProps} className={`${iconProps.className} text-ochre`} />
    ),
    'stakeholder_mapping': (
      <Users {...iconProps} className={`${iconProps.className} text-sky`} />
    ),
    'theory_of_change': (
      <Target {...iconProps} className={`${iconProps.className} text-grass`} />
    ),
    'risk_register': (
      <AlertTriangle {...iconProps} className={`${iconProps.className} text-sand`} />
    )
  };

  return iconMap[type] || (
    <FileText {...iconProps} className={`${iconProps.className} text-concrete`} />
  );
};

export default ReportTypeIcon;