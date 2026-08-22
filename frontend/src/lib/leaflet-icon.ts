import L from "leaflet";

// Leaflet auto-detects its marker image folder from leaflet.css and derives the
// sibling filenames (2x, shadow) by string replacement. Vite gives every asset a
// hashed filename in production builds, which breaks that guess and shows a broken
// image. Importing the images so Vite tracks them and pinning the exact URLs fixes
// it in both dev and prod.
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
