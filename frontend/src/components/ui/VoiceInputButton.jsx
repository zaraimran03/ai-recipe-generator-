import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './Toast';

export const VoiceInputButton = ({ onTranscript, className = '', size = 'md', lang = 'en-US', continuous = false }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const isFinal = !!finalTranscript;
      
      if (text && onTranscript) {
        onTranscript(text, isFinal);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        addToast('Microphone access denied. Please check permissions.', 'error');
      } else if (event.error === 'network') {
        addToast('Network error occurred during speech recognition.', 'error');
      } else if (event.error !== 'no-speech') {
        // Silently ignore no-speech timeouts
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, onTranscript, addToast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast('Voice input is not supported in your browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const iconSize = size === 'sm' ? 'text-[18px]' : 'text-[24px]';
  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? "Listening..." : "Voice Input"}
      className={`flex items-center justify-center rounded-full transition-all shrink-0 ${buttonSize} ${
        isListening
          ? 'bg-error/20 text-error animate-pulse shadow-[0_0_8px_rgba(255,84,73,0.3)]'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
      } ${className}`}
    >
      <span className={`material-symbols-outlined ${iconSize}`} style={isListening ? {fontVariationSettings: "'FILL' 1"} : {}}>
        {isListening ? 'mic' : 'mic_none'}
      </span>
    </button>
  );
};

export default VoiceInputButton;
