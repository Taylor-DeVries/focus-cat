import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";

type Mode = "focus" | "break";

const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_BREAK_DURATION = 5 * 60;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const getCatMood = (progress: number, mode: string) => {
  if (mode === "break") return "/images/sleep.png";
  if (progress === 1) return "/images/aplus.png";
  if (progress > 0.75) return "/images/focused.png";
  if (progress > 0.5) return "/images/study.png";
  if (progress > 0.25) return "/images/tired.png";
  return "/images/nerd-cat.png";
};

export default function Popup() {
  const [mode, setMode] = useState<Mode>("focus");
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [secondsLeft, setSecondsLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false); // For 5-minute celebrations
  const [showBigCelebration, setShowBigCelebration] = useState(false); // For study completion
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const total = mode === "focus" ? focusDuration : breakDuration;
  const progress = 1 - secondsLeft / total;
  const catMood = getCatMood(progress, mode);
  const isFocus = mode === "focus";

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          audioRef.current?.play();

          if (mode === "focus") {
            setShowBigCelebration(true);
            setTimeout(() => setShowBigCelebration(false), 5000); // Hide after 5 seconds
          }

          return nextMode === "focus" ? focusDuration : breakDuration;
        }

        if (prev % (5 * 60) === 0 && mode === "focus") {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000); // Hide after 3 seconds
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, focusDuration, breakDuration]);

  const handleStartPause = () => setIsRunning((prev) => !prev);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? focusDuration : breakDuration);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(newMode === "focus" ? focusDuration : breakDuration);
  };

  const handleSaveSettings = (
    newFocusDuration: number,
    newBreakDuration: number
  ) => {
    setFocusDuration(newFocusDuration);
    setBreakDuration(newBreakDuration);
    setSecondsLeft(mode === "focus" ? newFocusDuration : newBreakDuration);
    setShowSettings(false);
  };

  return (
    <div
      className={`w-64 h-80 p-4 rounded-2xl shadow-md flex flex-col items-center justify-between ${
        isFocus ? "bg-rose-50" : "bg-blue-50"
      } relative`}
    >
      {/* Celebration Animations */}
      {showCelebration && (
        <div className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none">
          <Confetti
            width={500}
            height={500}
            numberOfPieces={200}
            recycle={false}
          />
        </div>
      )}
      {showBigCelebration && (
        <div className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none">
          <Confetti
            width={500}
            height={500}
            numberOfPieces={500}
            recycle={false}
            gravity={0.2}
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="text-2xl mb-1 flex items-center justify-center">
          <img src={catMood} alt="Cat Mood" className="w-8 h-8 mr-2" />
          {isFocus ? "Study Time" : "Break Time"}
        </div>
        <div className="text-sm text-gray-500">
          {isFocus ? "Let’s stay focused!" : "Take a paws 🐾"}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => handleModeSwitch("focus")}
          className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
            mode === "focus"
              ? "bg-pink-300 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Study
        </button>
        <button
          onClick={() => handleModeSwitch("break")}
          className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
            mode === "break"
              ? "bg-blue-300 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-4xl font-mono text-gray-800">
        {formatTime(secondsLeft)}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-300 ${
            isFocus ? "bg-pink-400" : "bg-blue-400"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleStartPause}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl shadow"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl shadow"
        >
          Reset
        </button>
      </div>

      <button
        onClick={() => setShowSettings(true)}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow"
      >
        Settings
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col items-center justify-center p-4">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          <div className="flex flex-col space-y-2">
            <label>
              Study Duration (minutes):
              <input
                type="number"
                defaultValue={focusDuration / 60}
                className="border rounded p-1 w-full"
                onChange={(e) => setFocusDuration(Number(e.target.value) * 60)}
              />
            </label>
            <label>
              Break Duration (minutes):
              <input
                type="number"
                defaultValue={breakDuration / 60}
                className="border rounded p-1 w-full"
                onChange={(e) => setBreakDuration(Number(e.target.value) * 60)}
              />
            </label>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => handleSaveSettings(focusDuration, breakDuration)}
              className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white font-medium rounded-xl shadow"
            >
              Save
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl shadow"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meow sound */}
      <audio ref={audioRef} src="meow.mp3" preload="auto" />
    </div>
  );
}
