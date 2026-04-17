import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect } from 'react';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), {
        animate: true,
        duration: 1
      });
    }
  }, [center, map]);

  return null;
}

export default function LocationDisplayMap({ location }: { location: { lat: number; lon: number } }) {
  const center: [number, number] = [location.lat, location.lon];

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      scrollWheelZoom={false}
      className="h-full w-full relative z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ChangeView center={center} />
      <Marker position={center}/>
    </MapContainer>
  );
}
