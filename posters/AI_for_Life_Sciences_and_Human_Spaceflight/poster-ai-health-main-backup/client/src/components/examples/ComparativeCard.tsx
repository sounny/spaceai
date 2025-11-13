import { useState } from 'react';
import ComparativeCard from '../ComparativeCard';

export default function ComparativeCardExample() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="p-8 bg-background">
      <ComparativeCard 
        title="Satellite Communication"
        description="Advanced systems that enable global connectivity through orbital networks and relay stations."
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
    </div>
  );
}
