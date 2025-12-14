import { useState, useEffect } from 'react';
import { timeApi } from '../../utils/learningApi';

interface TimerProps {
  taskId: string;
  activeTimer: any;
  totalTimeSpent: number; // Total accumulated time in seconds
}

export default function Timer({ taskId, activeTimer: initialTimer, totalTimeSpent }: TimerProps) {
  const [isRunning, setIsRunning] = useState(!!initialTimer);
  const [startTime, setStartTime] = useState<Date | null>(
    initialTimer ? new Date(initialTimer.startTime) : null
  );
  const [currentSessionElapsed, setCurrentSessionElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setCurrentSessionElapsed(diff);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const handleStart = async () => {
    setLoading(true);
    const response = await timeApi.startTimer(taskId);
    
    if (response.data) {
      setStartTime(new Date(response.data.startTime));
      setIsRunning(true);
      setCurrentSessionElapsed(0);
    }
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    const response = await timeApi.stopTimer(taskId);
    
    if (response.data) {
      setIsRunning(false);
      setStartTime(null);
      setCurrentSessionElapsed(0);
      // Note: totalTimeSpent will be updated by the parent component after refresh
    }
    setLoading(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate total time: accumulated time + current session time
  const displayTime = totalTimeSpent + currentSessionElapsed;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
          isRunning 
            ? 'bg-blue-500/10 border-blue-500/30' 
            : 'bg-gray-700/30 border-gray-600/30'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`} />
        <span className={`font-mono text-xs font-medium ${isRunning ? 'text-blue-400' : 'text-gray-400'}`}>
          {formatTime(displayTime)}
        </span>
      </div>

      <button
        onClick={isRunning ? handleStop : handleStart}
        disabled={loading}
        className={`p-1.5 rounded-md transition-all duration-200 border ${
          isRunning
            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRunning ? 'Stop Timer' : 'Start Timer'}
      >
        {loading ? (
             <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
        ) : isRunning ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
        ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
            </svg>
        )}
      </button>
    </div>
  );
}
