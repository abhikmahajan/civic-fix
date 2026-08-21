import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechToText({ lang = 'en-IN', continuous = true } = {}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };
    recognition.onerror = (event) => { setError(event.error); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [lang, continuous]);

  const start = useCallback(() => {
    setError(null); setTranscript('');
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { transcript, isListening, error, isSupported, start, stop, setTranscript };
}
