import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationPicker({ onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [manual, setManual] = useState({ lat: '', lng: '' });

  const detectLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocation(coords);
        if (onLocationSelect) onLocationSelect(coords);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to detect location');
        setLoading(false);
      }
    );
  };

  const handleManual = () => {
    const coords = { latitude: parseFloat(manual.lat), longitude: parseFloat(manual.lng) };
    if (!isNaN(coords.latitude) && !isNaN(coords.longitude)) {
      setLocation(coords);
      if (onLocationSelect) onLocationSelect(coords);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-xl bg-gray-50">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={detectLocation}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Navigation size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Detecting...' : 'Auto-detect Location'}
        </button>
        {location && (
          <span className="text-sm font-medium text-green-700 flex items-center gap-1">
            <MapPin size={16} /> Location Set
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border-t pt-4 mt-2">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Manual Entry Fallback</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Latitude"
            className="flex-1 p-2 border rounded"
            value={manual.lat}
            onChange={e => setManual({...manual, lat: e.target.value})}
            onBlur={handleManual}
          />
          <input
            type="number"
            placeholder="Longitude"
            className="flex-1 p-2 border rounded"
            value={manual.lng}
            onChange={e => setManual({...manual, lng: e.target.value})}
            onBlur={handleManual}
          />
        </div>
      </div>
    </div>
  );
}
