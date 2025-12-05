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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500 rounded-lg">
        {isRunning && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
        <span className="text-blue-400 font-mono text-sm">{formatTime(displayTime)}</span>
      </div>

      <button
        onClick={isRunning ? handleStop : handleStart}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? '...' : isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
