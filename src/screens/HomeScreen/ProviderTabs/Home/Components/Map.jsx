import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; 
import logo from "../../../../../../assets/Logo/logo-light.png";


const customIcon = new L.Icon({
  iconUrl: logo, 
  iconSize: [38, 38], 
  iconAnchor: [19, 38], 
  popupAnchor: [0, -38], 
});

export default function Map() {
  
  const position = [31.40051627362964, 74.21280728158759];

  return (
    <div style={styles.container}>
      <MapContainer center={position} zoom={15} style={styles.map} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          <Popup></Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh", 
    width: "100%",
  },
  map: {
    height: "100%",
    width: "100%",
  },
};
