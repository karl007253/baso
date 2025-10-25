'use client';

import { useState, useEffect, useRef } from 'react';

interface Person {
  id: string;
  name: string;
  drinkCount: number;
}

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [newPersonName, setNewPersonName] = useState('');
  const [timerDuration, setTimerDuration] = useState(2); // in minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio and request notification permission
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished - play notification and auto-advance
            playNotification();
            advanceToNextPerson();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, isPaused, timeRemaining]);

  const playNotification = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification failed:', error);
      // Fallback: show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Time\'s up!', {
          body: 'Next person\'s turn!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        drinkCount: 0,
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const removePerson = (id: string) => {
    const updatedPeople = people.filter(person => person.id !== id);
    setPeople(updatedPeople);
    
    // Adjust current person index if needed
    if (currentPersonIndex >= updatedPeople.length && updatedPeople.length > 0) {
      setCurrentPersonIndex(0);
    }
  };

  const advanceToNextPerson = () => {
    if (people.length === 0) return;
    
    const currentPerson = people[currentPersonIndex];
    setPeople(prev => prev.map(person => 
      person.id === currentPerson.id 
        ? { ...person, drinkCount: person.drinkCount + 1 }
        : person
    ));
    
    setCurrentPersonIndex((prev) => (prev + 1) % people.length);
    setTimeRemaining(timerDuration * 60);
  };

  const startTimer = () => {
    if (people.length === 0) return;
    setTimeRemaining(timerDuration * 60);
    setIsTimerRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetRound = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setCurrentPersonIndex(0);
    setPeople(prev => prev.map(person => ({ ...person, drinkCount: 0 })));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPerson = people[currentPersonIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">🍻 Round Robin Drinking App</h1>
          <p className="text-sm sm:text-base text-gray-600">Take turns and track your drinks!</p>
        </div>

        {/* Add Person Form */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Add People</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Enter person's name"
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addPerson()}
            />
            <button
              onClick={addPerson}
              className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Timer Settings</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-sm sm:text-base">Duration (minutes):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={startTimer}
                disabled={people.length === 0 || isTimerRunning}
                className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                Start Round
              </button>
              <button
                onClick={pauseTimer}
                disabled={!isTimerRunning}
                className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetRound}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Timer Display */}
          {isTimerRunning && (
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              {currentPerson && (
                <div className="text-base sm:text-lg text-gray-700">
                  Current turn: <span className="font-semibold text-blue-600">{currentPerson.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* People List */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">People ({people.length})</h2>
          {people.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No people added yet. Add some people to start!</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    index === currentPersonIndex && isTimerRunning
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      index === currentPersonIndex && isTimerRunning
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm sm:text-base block truncate ${
                        index === currentPersonIndex && isTimerRunning
                          ? 'text-blue-600'
                          : 'text-gray-700'
                      }`}>
                        {person.name}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {person.drinkCount} drink{person.drinkCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="px-2 sm:px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-colors text-xs sm:text-sm flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drank Button - Mobile First */}
        {people.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:relative sm:border-t-0 sm:bg-transparent sm:p-0">
            <div className="text-center">
              <button
                onClick={advanceToNextPerson}
                disabled={people.length === 0}
                className="w-full sm:w-auto px-8 py-6 sm:py-4 bg-green-500 text-white text-2xl sm:text-xl font-bold rounded-xl sm:rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 shadow-xl sm:shadow-lg hover:shadow-2xl sm:hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                🍻 Drank!
              </button>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 hidden sm:block">
                Click when the current person finishes their drink
              </p>
              {currentPerson && (
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {currentPerson.name} has had {currentPerson.drinkCount} drink{currentPerson.drinkCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {people.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6 mb-20 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Round Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{people.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total People</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {people.reduce((sum, person) => sum + person.drinkCount, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Drinks</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}