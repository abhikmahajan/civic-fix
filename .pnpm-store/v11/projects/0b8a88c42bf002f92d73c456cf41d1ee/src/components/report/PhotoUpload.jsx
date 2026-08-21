import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

export default function PhotoUpload({ onImageSelect }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        <button
          onClick={removeImage}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
          type="button"
        >
          <X className="text-gray-600" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
          <Upload className="text-gray-600" />
        </div>
        <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
          <Camera className="text-gray-600" />
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-700">Click to capture or upload</p>
        <p className="text-sm text-gray-500">Drag and drop supported</p>
      </div>
    </div>
  );
}
