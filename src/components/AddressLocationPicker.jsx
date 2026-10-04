import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/address-location-picker.css";

// Dar es Salaam is a practical starting view; customers can pan or zoom anywhere.
const TANZANIA_MAP_CENTER = [-6.7924, 39.2083];

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(event) {
            onSelect({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

function MapViewUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: false });
    }, [map, center]);

    return null;
}

/** Let customers choose a map point without needing to know coordinate values. */
function AddressLocationPicker({ latitude, longitude, onChange }) {
    const [locationError, setLocationError] = useState("");
    const hasSelection = latitude !== "" && longitude !== "" && latitude != null && longitude != null;

    const center = useMemo(() => (
        hasSelection
            ? [Number(latitude), Number(longitude)]
            : TANZANIA_MAP_CENTER
    ), [hasSelection, latitude, longitude]);

    const selectCurrentLocation = () => {
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("This browser cannot access device location. Choose your delivery point on the map instead.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => onChange({ latitude: coords.latitude, longitude: coords.longitude }),
            (error) => setLocationError(error.message || "Unable to get your current location."),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
    };

    return (
        <section className="address-location-picker" aria-label="Choose delivery location">
            <div className="address-location-picker-heading">
                <div>
                    <strong>Pin your delivery location</strong>
                    <p>Click the map at your home or delivery entrance. You can move the map and zoom in for accuracy.</p>
                </div>
                <button type="button" onClick={selectCurrentLocation}>
                    Use my current location
                </button>
            </div>

            <MapContainer center={center} zoom={hasSelection ? 16 : 12} scrollWheelZoom className="address-location-map">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewUpdater center={center} />
                <MapClickHandler onSelect={onChange} />
                {hasSelection && (
                    <CircleMarker
                        center={center}
                        radius={9}
                        pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#b8892f", fillOpacity: 1 }}
                    />
                )}
            </MapContainer>

            <p className="address-location-picker-status" role="status">
                {locationError || (hasSelection ? "Delivery point selected." : "Select a point on the map to continue.")}
            </p>
        </section>
    );
}

export default AddressLocationPicker;
