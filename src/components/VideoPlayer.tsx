/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Clock, CirclePlay, RefreshCw } from 'lucide-react';
import { PopupCheckpoint, PopupPosition, VideoTemplate } from '../types';
import { formatSecondsShort } from '../utils/timeFormatter';

interface VideoPlayerProps {
  template: VideoTemplate;
  userVideoUrl: string | null;
  userVideoName: string | null;
  currentTime: number;
  onTimeUpdate: React.Dispatch<React.SetStateAction<number>>;
  checkpoints: PopupCheckpoint[];
  onSetDuration: (duration: number) => void;
  isPlaying: boolean;
  onSetIsPlaying: (playing: boolean) => void;
}

export default function VideoPlayer({
  template,
  userVideoUrl,
  userVideoName,
  currentTime,
  onTimeUpdate,
  checkpoints,
  onSetDuration,
  isPlaying,
  onSetIsPlaying,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Player state attributes
  const [muted, setMuted] = useState(false);
  const [activePopup, setActivePopup] = useState<PopupCheckpoint | null>(null);
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Determine current active URL source
  const videoSourceUrl = useMemo(() => {
    if (userVideoUrl) return userVideoUrl;
    return template.url;
  }, [userVideoUrl, template]);

  // Robustly grab the exact video dimensions and duration under all conditions.
  // The user reported a bug where the video end time couldn't be set to the full duration.
  // We attach multiple event triggers (loadedmetadata, durationchange, canplay, loadeddata)
  // to ensure that we fetch the duration accurately as soon as the media object is loaded.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        onSetDuration(video.duration);
      }
    };

    // Trigger immediately if already loaded
    updateDuration();

    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('canplay', updateDuration);
    video.addEventListener('loadeddata', updateDuration);

    return () => {
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('canplay', updateDuration);
      video.removeEventListener('loadeddata', updateDuration);
    };
  }, [videoSourceUrl, onSetDuration]);

  // Monitor playback control trigger state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {
        onSetIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, videoSourceUrl, onSetIsPlaying]);

  // Synchronize dynamic seek requests
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.4) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdateRaw = () => {
    const video = videoRef.current;
    if (!video) return;
    onTimeUpdate(video.currentTime);
  };

  // Detect matching auto-pausing checkpoint markers during runtime playback
  useEffect(() => {
    const currentRounded = Math.floor(currentTime);

    // Find if a popup corresponds to this exact timestamp
    const match = checkpoints.find(
      (cp) => Math.floor(cp.timeInSeconds) === currentRounded
    );

    if (match) {
      if (lastTriggeredId !== match.id && !activePopup) {
        onSetIsPlaying(false); // AUTO-PAUSE!
        setActivePopup(match);
        setLastTriggeredId(match.id);
        setCountdown(match.duration);
      }
    } else {
      // Allow re-triggering if the user seeked far away from the active checkpoint
      if (lastTriggeredId) {
        const triggeredCp = checkpoints.find(c => c.id === lastTriggeredId);
        if (triggeredCp) {
          const dist = Math.abs(currentTime - triggeredCp.timeInSeconds);
          if (dist > 1.5) {
            setLastTriggeredId(null);
          }
        }
      }
    }
  }, [currentTime, checkpoints, activePopup, lastTriggeredId, onSetIsPlaying]);

  // Auto-resume timer countdown controller
  useEffect(() => {
    if (countdown === null || activePopup === null) return;
    if (countdown <= 0) {
      handleResume();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, activePopup]);

  const handleResume = () => {
    setActivePopup(null);
    setCountdown(null);
    onSetIsPlaying(true);
  };

  const handleSkipPopup = () => {
    setActivePopup(null);
    setCountdown(null);
  };

  const handleRestart = () => {
    onTimeUpdate(0);
    setLastTriggeredId(null);
    setActivePopup(null);
    setCountdown(null);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    onSetIsPlaying(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    } else {
      setMuted(!muted);
    }
  };

  // Convert layout positions to social-theme coordinate bindings
  const getPositionClasses = (pos: PopupPosition) => {
    switch (pos) {
      case 'top-left':
        return 'absolute top-5 left-5';
      case 'top-right':
        return 'absolute top-5 right-5';
      case 'bottom-left':
        return 'absolute bottom-16 left-5';
      case 'bottom-right':
        return 'absolute bottom-16 right-5';
      case 'center':
      default:
        return 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="relative flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm" id="social-video-player">
      
      {/* Soft Light Workspace Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-slate-700 font-extrabold truncate max-w-sm">
            {userVideoUrl ? `Source: ${userVideoName}` : 'Template: Default Waves Story'}
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
          Live Stream Sandbox
        </div>
      </div>

      {/* Primary Video Canvas Area */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoSourceUrl}
          onTimeUpdate={handleTimeUpdateRaw}
          onEnded={() => onSetIsPlaying(false)}
          onClick={() => onSetIsPlaying(!isPlaying)}
          muted={muted}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
          crossOrigin="anonymous"
        />

        {/* Overlay Pause Popups (Beautiful Rounded Card styled with max 12px inset) */}
        {activePopup && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-all duration-300 pointer-events-auto z-20 flex items-center justify-center p-3 animate-fade-in">
            <div className="bg-white/95 border border-slate-100 rounded-3xl p-4 shadow-2xl animate-scale-up text-slate-800 flex flex-col max-h-full max-w-full w-auto h-auto transition-all">
              
              {/* Centered Image Showcase */}
              <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50 border border-slate-100/65 rounded-2xl overflow-hidden">
                <img
                  src={activePopup.imageUrl}
                  alt={activePopup.title}
                  className="max-h-full max-w-full object-contain rounded-2xl p-1.5"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Description Info below the image */}
              <div className="mt-3 shrink-0 text-center space-y-1 px-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                  {activePopup.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                  {activePopup.description}
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Control Navigation Console */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetIsPlaying(!isPlaying)}
            className="p-3 bg-white hover:bg-slate-50 text-slate-850 hover:text-blue-600 border border-slate-250/60 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95"
            id="play-pause-control"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} className="stroke-[2.5]" /> : <Play size={18} className="stroke-[2.5]" />}
          </button>
          
          <button
            type="button"
            onClick={handleRestart}
            className="p-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border border-slate-250/60 rounded-2xl transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Restart Video"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Dynamic Center Timer Gauge */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-900 bg-white shadow-xs px-3 py-2 rounded-2xl border border-slate-150">
            {formatSecondsShort(currentTime)}
          </span>
          <span className="text-slate-400 font-bold">of</span>
          <span className="text-slate-600 bg-white/50 px-3 py-2 rounded-2xl border border-slate-150">
            {videoRef.current?.duration ? formatSecondsShort(videoRef.current.duration) : formatSecondsShort(template.duration)}
          </span>
        </div>

        {/* Sound Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-250/60 rounded-2xl transition-colors cursor-pointer shadow-xs"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
