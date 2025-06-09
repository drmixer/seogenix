import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface FeatureRestrictionProps {
  title: string;
  description: string;
  requiredPlan: string;
  currentPlan?: string;
}

const FeatureRestriction: React.FC<FeatureRestrictionProps> = ({
  title,
  description,
  requiredPlan,
  currentPlan = 'Free'
}) => {
  const planColors = {
    'Free': 'text-green-600',
    'Core': 'text-blue-600', 
    'Pro': 'text-purple-600',
    'Agency': 'text-gray-600'
  };

  const requiredPlanColor = planColors[requiredPlan as keyof typeof planColors] || 'text-gray-600';

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Current Plan:</span> <span className={planColors[currentPlan as keyof typeof planColors] || 'text-gray-600'}>{currentPlan}</span>
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <span className="font-medium">Required:</span> <span className={requiredPlanColor}>{requiredPlan}</span> plan or higher
        </p>
      </div>
      <Link to="/account-settings">
        <Button variant="primary">
          Upgrade to {requiredPlan}
        </Button>
      </Link>
    </div>
  );
};

export default FeatureRestriction;