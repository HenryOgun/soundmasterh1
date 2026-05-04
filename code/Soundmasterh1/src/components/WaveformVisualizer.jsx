import React from 'react';

const WaveformVisualizer = ({ bars = 50, isPlaying = false }) => {
  return (
    <div className="flex items-end justify-center space-x-1 h-32">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-sm transition-all duration-300 ${
            isPlaying ? 'animate-waveform' : ''
          }`}
          style={{
            width: '4px',
            height: `${Math.random() * 100 + 20}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;