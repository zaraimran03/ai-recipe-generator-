import React, { useState, useEffect, useRef, useCallback } from 'react';

const VOICE_COMMANDS = {
  next: ['next', 'next step', 'continue', 'go'],
  prev: ['back', 'previous', 'go back'],
  start: ['start timer', 'start', 'begin timer'],
  stop: ['stop timer', 'stop', 'pause timer'],
};

const matchCommand = (transcript) => {
  const t = transcript.toLowerCase().trim();
  for (const [cmd, phrases] of Object.entries(VOICE_COMMANDS)) {
    if (phrases.some(p => t.includes(p))) return cmd;
  }
  return null;
};

export const CookMode = ({ recipe, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);

  const steps = recipe.instructions || [];
  const currentStep = steps[stepIndex];
  const total = steps.length;

  // Timer logic
  const startTimer = useCallback((minutes) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      setTimerRunning(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timeLeft]);

  // Reset timer on step change
  useEffect(() => {
    stopTimer();
    setTimeLeft(null);
  }, [stepIndex]);

  // Voice recognition
  const startVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setVoiceStatus(`Heard: "${transcript}"`);
      const cmd = matchCommand(transcript);
      if (cmd === 'next') setStepIndex(i => Math.min(i + 1, total - 1));
      if (cmd === 'prev') setStepIndex(i => Math.max(i - 1, 0));
      if (cmd === 'start' && currentStep?.timerInMinutes) startTimer(currentStep.timerInMinutes);
      if (cmd === 'stop') stopTimer();
    };
    recognition.onerror = () => setVoiceStatus('Voice error — try again');
    recognition.onend = () => { if (voiceActive) recognition.start(); };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceActive(true);
    setVoiceStatus('Listening...');
  }, [voiceActive, currentStep, total, startTimer, stopTimer]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceActive(false);
    setVoiceStatus('');
  }, []);

  useEffect(() => () => { recognitionRef.current?.stop(); clearInterval(intervalRef.current); }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Cook Mode</p>
          <h2 className="font-headline-md text-on-surface">{recipe.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={voiceActive ? stopVoice : startVoice}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-label-md transition-all ${voiceActive ? 'bg-primary text-on-primary' : 'glass-card text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-lg">{voiceActive ? 'mic' : 'mic_off'}</span>
            {voiceActive ? 'Voice On' : 'Voice Off'}
          </button>
          <button onClick={onClose} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-outline-variant">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-3xl mx-auto w-full text-center">
        <div className="text-label-sm text-primary uppercase tracking-widest mb-4">
          Step {stepIndex + 1} of {total}
        </div>

        <p className="text-3xl md:text-4xl font-medium text-on-surface leading-relaxed mb-8">
          {currentStep?.instruction}
        </p>

        {/* Timer section */}
        {currentStep?.timerInMinutes && (
          <div className="flex flex-col items-center gap-4 mb-8">
            {timeLeft !== null ? (
              <>
                <div className={`text-5xl font-mono font-bold ${timeLeft === 0 ? 'text-primary' : 'text-on-surface'}`}>
                  {timeLeft === 0 ? '✓ Done!' : formatTime(timeLeft)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => timerRunning ? stopTimer() : startTimer(currentStep.timerInMinutes)}
                    className="glass-card px-6 py-2 rounded-full text-label-md hover:text-primary transition-all"
                  >
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => { stopTimer(); setTimeLeft(null); }} className="glass-card px-6 py-2 rounded-full text-label-md hover:text-primary transition-all">
                    Reset
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => startTimer(currentStep.timerInMinutes)}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label-md hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined">timer</span>
                Start {currentStep.timerInMinutes} min Timer
              </button>
            )}
          </div>
        )}

        {/* Voice status */}
        {voiceStatus && (
          <p className="text-label-sm text-on-surface-variant italic mb-6">{voiceStatus}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 border-t border-outline-variant flex items-center justify-between max-w-3xl mx-auto w-full">
        <button
          onClick={() => setStepIndex(i => Math.max(i - 1, 0))}
          disabled={stepIndex === 0}
          className="flex items-center gap-2 glass-card px-6 py-3 rounded-full font-label-md disabled:opacity-30 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span> Previous
        </button>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStepIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === stepIndex ? 'bg-primary w-6' : 'bg-outline-variant hover:bg-primary/50'}`}
            />
          ))}
        </div>

        {stepIndex < total - 1 ? (
          <button
            onClick={() => setStepIndex(i => i + 1)}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label-md hover:opacity-90 transition-all"
          >
            Next <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-label-md hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined">check_circle</span> Done!
          </button>
        )}
      </div>
    </div>
  );
};

export default CookMode;
