import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-icon";

export default function LocationPicker({setLocation, defaultLat, defaultLon, askForLocation} : {setLocation: CallableFunction, defaultLat: number, defaultLon: number, askForLocation: boolean}) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const [locationError, setLocationError] = useState("");
    const markerRef = useRef<L.Marker | null>(null);

    async function askUserLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!leafletMapRef.current)
                    return ;

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
             
                setLocation(lat, lng);

                leafletMapRef.current.setView([lat, lng], 12);

                if (!markerRef.current) {
                    markerRef.current = L.marker([lat, lng]).addTo(leafletMapRef.current);
                } else {
                    markerRef.current.setLatLng([lat, lng]);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationError("We could not locate you, please select your location");
            }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    function onMapClick(e: L.LeafletMouseEvent) {
        if (!leafletMapRef.current) return;

        setLocationError("");

        const { lat, lng } = e.latlng;

        if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(leafletMapRef.current);
        } else {
            markerRef.current.setLatLng([lat, lng]);
        }

        markerRef.current.bindPopup("Your location");
        setLocation(lat, lng);
    }

    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current).setView([defaultLat, defaultLon], 13);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        leafletMapRef.current = map;

        markerRef.current = L.marker([defaultLat, defaultLon]).addTo(map);
        markerRef.current.bindPopup("Your location");
        setLocation(defaultLat, defaultLon);

        map.on("click", onMapClick);

        if (askForLocation)
            askUserLocation();

        // Cleanup on unmount
        return () => {
            map.remove();
            leafletMapRef.current = null;
        };

    }, []);


    return (
        <>
            <div className='my-1'>
                <p className='text-red-500'>{locationError}</p>
            </div>
            <div id="map" className='mt-4' ref={mapRef} style={{ height: "400px", width: "100%" }}/>
        </>
    );
}