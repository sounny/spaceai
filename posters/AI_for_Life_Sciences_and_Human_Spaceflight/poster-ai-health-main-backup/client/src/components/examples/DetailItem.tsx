import DetailItem from '../DetailItem';
import satelliteImage from '@assets/generated_images/Communication_satellite_in_orbit_627a2035.png';

export default function DetailItemExample() {
  return (
    <div className="p-8 bg-background max-w-sm">
      <DetailItem 
        title="GPS Satellite"
        description="Provides precise location and timing services for navigation systems worldwide."
        image={satelliteImage}
        index={0}
      />
    </div>
  );
}
