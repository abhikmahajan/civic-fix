import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Languages } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';

const LANG_OPTIONS = [
  { label: 'English', value: 'en-IN' },
  { label: 'Hindi', value: 'hi-IN' },
  { label: 'Hinglish', value: 'hi-IN' }
];

export default function VoiceRecorder({ onTranscript }) {
  const [lang, setLang] = useState('en-IN');
  const { transcript, isListening, isSupported, start, stop, setTranscript } = useSpeechToText({ lang, continuous: true });

  useEffect(() => {
    if (onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return (
      <div className="w-full">
        <textarea
          className="w-full p-3 border rounded-lg"
          rows="4"
          placeholder="Speech recognition not supported. Type your complaint here..."
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            if (onTranscript) onTranscript(e.target.value);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4 border rounded-xl bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="text-gray-500" size={20} />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent font-medium focus:outline-none"
          >
            {LANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={isListening ? stop : start}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all ${
            isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>
      
      <textarea
        className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        rows="4"
        placeholder="Tap the microphone to start speaking..."
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          if (onTranscript) onTranscript(e.target.value);
        }}
      />
    </div>
  );
}
