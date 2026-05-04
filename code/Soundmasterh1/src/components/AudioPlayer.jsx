import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';

const AudioPlayer = ({ src, title, artist }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-gray-400">{artist}</p>
      </div>
      <WaveformVisualizer bars={60} isPlaying={isPlaying} />
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="bg-purple-600 p-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button className="text-gray-400 hover:text-white">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        <span className="text-sm text-gray-400">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;