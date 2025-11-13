import ComparativeSection from '../ComparativeSection';
import issImage from '@assets/generated_images/ISS_satellite_orbital_view_609a170c.png';
import satImage from '@assets/generated_images/Communication_satellite_in_orbit_627a2035.png';
import marsImage from '@assets/generated_images/Mars_rover_exploration_scene_0422cee2.png';
import telescopeImage from '@assets/generated_images/Space_telescope_in_orbit_61b62f42.png';

export default function ComparativeSectionExample() {
  const comparatives = [
    {
      title: "Orbital Systems",
      description: "Complex networks of satellites and stations in Earth orbit.",
      details: [
        {
          title: "Space Station",
          description: "International collaboration for research in microgravity.",
          image: issImage
        },
        {
          title: "Communication Satellite",
          description: "Enables global data transmission and connectivity.",
          image: satImage
        },
        {
          title: "Weather Satellite",
          description: "Monitors atmospheric conditions and climate patterns.",
          image: telescopeImage
        },
        {
          title: "GPS Network",
          description: "Provides precise location services worldwide.",
          image: satImage
        }
      ]
    },
    {
      title: "Exploration Missions",
      description: "Ventures beyond Earth to discover new worlds.",
      details: [
        {
          title: "Mars Rover",
          description: "Robotic exploration of the Red Planet's surface.",
          image: marsImage
        },
        {
          title: "Space Telescope",
          description: "Observes distant galaxies and cosmic phenomena.",
          image: telescopeImage
        },
        {
          title: "Lunar Lander",
          description: "Establishes presence on the Moon's surface.",
          image: issImage
        },
        {
          title: "Deep Space Probe",
          description: "Travels to outer solar system and beyond.",
          image: telescopeImage
        }
      ]
    }
  ];

  return <ComparativeSection title="Space Technologies" comparatives={comparatives} />;
}
