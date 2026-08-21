import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Camera, MapPin, Mic, Shield } from 'lucide-react';
import { api } from '../services/api.js';
import { useOfflineQueue } from '../hooks/useOfflineQueue.js';
import PhotoUpload from '../components/report/PhotoUpload.jsx';
import VoiceRecorder from '../components/report/VoiceRecorder.jsx';
import LocationPicker from '../components/report/LocationPicker.jsx';

export default function ReportPage() {
  const [imageFile, setImageFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isOnline, addToQueue } = useOfflineQueue();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!transcript && !imageFile) {
      setError('Please provide at least a photo or a description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      formData.append('description', transcript || 'No description provided');
      if (location) {
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
      }

      if (!isOnline) {
        const imageDataUrl = imageFile ? await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        }) : null;
        addToQueue({ description: transcript, latitude: location?.latitude, longitude: location?.longitude, imageDataUrl, imageName: imageFile?.name });
        setError(null);
        alert('You are offline. Report saved locally and will sync when connection is restored.');
        return;
      }

      const data = await api.createComplaint(formData);
      
      if (data && data.id) {
        navigate(`/analysis/${data.id}`);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Shield className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">See a problem? Show us.</h1>
        <p className="text-blue-100 text-lg max-w-lg mx-auto">
          Upload a photo, describe the issue in any language, and let AI route it to the right department.
        </p>
      </div>

      {/* Report Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Photo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg border-b border-slate-100 pb-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h2>1. Snap a Photo</h2>
            </div>
            <PhotoUpload onImageSelect={setImageFile} />
          </div>

          {/* Section 2: Voice/Text */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg border-b border-slate-100 pb-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <h2>2. Describe the Issue</h2>
              <span className="text-xs text-slate-400 font-normal ml-auto">Hindi / English / Hinglish</span>
            </div>
            <VoiceRecorder onTranscript={setTranscript} />
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg border-b border-slate-100 pb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2>3. Confirm Location</h2>
            </div>
            <LocationPicker onLocationSelect={setLocation} />
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting your report...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Report Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
