import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Music } from 'lucide-react';
import audioTracks from './audioData';

function formatDuration(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function AudioCard({ track, activeId, onPlay }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Stop this card when another track becomes active
  useEffect(() => {
    if (activeId !== track.id && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [activeId, track.id, playing]);

  const handlePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    onPlay(track.id);
    a.play();
    setPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const handleStop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.11)] transition-all duration-300 overflow-hidden">
      <audio
        ref={audioRef}
        src={track.src}

        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setProgress(e.target.currentTime / (e.target.duration || 1))}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />

      <div className="h-1 bg-[#f4b940]" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug">{track.title}</h3>
          {track.tag && (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{track.tag}</span>
          )}
        </div>
        <div className="w-10 h-0.5 bg-[#f4b940] mb-3" />

        {track.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-4">{track.description}</p>
        )}

        {/* Player */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={playing ? handlePause : handlePlay}
            className="w-9 h-9 bg-[#f4b940] rounded-full flex items-center justify-center shrink-0 hover:bg-yellow-400 transition-colors"
          >
            {playing
              ? <Pause size={14} className="text-black" />
              : <Play size={14} className="text-black ml-0.5" />}
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors"
          >
            <Square size={12} className="text-gray-600" />
          </button>

          {/* Progress bar */}
          <div
            className="flex-1 h-1.5 bg-gray-100 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) {
                audioRef.current.currentTime = ratio * audioRef.current.duration;
                setProgress(ratio);
              }
            }}
          >
            <div
              className="h-full bg-[#f4b940] rounded-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <span className="text-xs text-gray-400 shrink-0 w-8 text-right">{formatDuration(duration)}</span>
        </div>

        {track.date && <p className="text-[10px] text-gray-300 mt-3">{track.date}</p>}
      </div>
    </div>
  );
}

export default function AudioProductionPage() {
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="relative py-24 min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: 'url(/h2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      <div className="absolute inset-0 bg-white/90" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Sound, studio craft, and audio engineering</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audio Production</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
        </div>

        {audioTracks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Music size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tracks available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {audioTracks.map((track) => (
              <AudioCard
                key={track.id}
                track={track}
                activeId={activeId}
                onPlay={setActiveId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
