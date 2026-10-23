import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Skill } from '../../types';

interface LeafletMapProps {
  skills: Skill[];
  center?: [number, number];
  zoom?: number;
  onSelectSkill?: (skillId: string) => void;
  className?: string;
  userLocation?: [number, number];
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  skills,
  center = [37.7749, -122.4194],
  zoom = 12,
  onSelectSkill,
  className = 'h-96 w-full rounded-2xl',
  userLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet marker icon paths
    const customIcon = L.divIcon({
      className: 'custom-skill-marker',
      html: `
        <div style="background-color: #16a34a; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 3px solid white; color: white; font-size: 16px; cursor: pointer;">
          🎓
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    });

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 3px solid white; color: white; font-size: 13px;">
          📍
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    // Initialize map if not yet initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add user location marker if present
    if (userLocation) {
      const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <strong style="color: #0369a1;">You are here</strong>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">Approximate location for local skill matching</p>
        </div>
      `);
      L.circle(userLocation, {
        radius: 3000,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.1,
        weight: 1.5,
      }).addTo(map);
    }

    // Add skill markers
    const validSkills = skills.filter((s) => s.latitude && s.longitude);
    const bounds = L.latLngBounds([]);

    if (userLocation) {
      bounds.extend(userLocation);
    }

    validSkills.forEach((skill) => {
      const pos: [number, number] = [skill.latitude!, skill.longitude!];
      bounds.extend(pos);

      const marker = L.marker(pos, { icon: customIcon }).addTo(map);

      const popupHtml = document.createElement('div');
      popupHtml.style.padding = '4px';
      popupHtml.style.fontFamily = 'sans-serif';
      popupHtml.innerHTML = `
        <div style="min-width: 180px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #16a34a; font-weight: bold; margin-bottom: 2px;">
            ${skill.category}
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; line-height: 1.3; margin-bottom: 4px;">
            ${skill.title}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            Teacher: <strong>${skill.teacherName}</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #b45309; font-size: 12px; font-weight: bold;">★ ${skill.rating.toFixed(1)} (${skill.reviewCount})</span>
            <span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569;">${skill.mode}</span>
          </div>
          <button id="btn-view-${skill.id}" style="width: 100%; background: #16a34a; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
            View Skill Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle popup open to bind button click
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${skill.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectSkill) {
              onSelectSkill(skill.id);
            }
          };
        }
      });
    });

    if (validSkills.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // Map stays attached to ref until unmount
    };
  }, [skills, userLocation, onSelectSkill]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative shadow-inner overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
        <span>Local Skill Nodes</span>
      </div>
    </div>
  );
};
