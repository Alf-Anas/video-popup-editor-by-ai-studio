/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, MouseEvent } from 'react';
import { Layers } from 'lucide-react';
import { PopupCheckpoint } from '../types';
import { formatSecondsShort } from '../utils/timeFormatter';

interface TimelineProps {
  duration: number;
  currentTime: number;
  checkpoints: PopupCheckpoint[];
  onSeekTo: (seconds: number) => void;
}

export default function Timeline({
  duration,
  currentTime,
  checkpoints,
  onSeekTo,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleTrackInteraction = (e: MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeekTo(percentage * duration);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm" id="custom-video-timeline">
      {/* Track info bar details */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 tracking-wider uppercase">
          <Layers size={14} className="text-blue-600" />
          Interactive Popup Timeline
        </div>
        <div className="text-xs font-bold text-slate-450 flex items-center gap-2">
          <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-full">{formatSecondsShort(currentTime)}</span>
          <span className="text-slate-300 font-normal">/</span>
          <span>{formatSecondsShort(duration)}</span>
        </div>
      </div>

      {/* Slider deck Lane */}
      <div className="relative pt-1 pb-2">
        <div 
          ref={barRef}
          onClick={handleTrackInteraction}
          className="relative h-6 bg-slate-100 border border-slate-150 rounded-xl cursor-pointer group select-none overflow-visible shadow-inner"
        >
          {/* Timeline segments and grid tick labels */}
          <div className="absolute inset-0 flex justify-between px-3 text-[9px] font-bold text-slate-400 pointer-events-none items-center">
            {Array.from({ length: 5 }).map((_, idx) => {
              const fraction = idx / 4;
              return (
                <span key={idx} className="font-mono">
                  {formatSecondsShort(fraction * duration)}
                </span>
              );
            })}
          </div>

          {/* Current track played stream coverage */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-blue-600/10 border-r-2 border-blue-600 pointer-events-none rounded-l-xl transition-all duration-75"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Keyframe Pause Markers Overlay */}
          {checkpoints.map((cp) => {
            const markerPos = duration > 0 ? (cp.timeInSeconds / duration) * 100 : 0;
            const sizeStyle = Math.floor(cp.timeInSeconds) === Math.floor(currentTime) 
              ? 'scale-125 z-10 font-bold' 
              : 'hover:scale-110';
            
            return (
              <div
                key={cp.id}
                className={`absolute top-0 bottom-0 w-2.5 flex items-center justify-center cursor-pointer transition-all ${sizeStyle}`}
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation(); // Avoid firing slider line clicks
                  onSeekTo(cp.timeInSeconds);
                }}
              >
                {/* Visual guideline downwards with beautiful red dot pins */}
                <div className="absolute -top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 hover:scale-125 transition-all" />
                <div className="h-full w-0.5 bg-red-400/80" />

                {/* Micro tooltip hover display */}
                <div className="absolute bottom-full mb-3.5 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] p-2 rounded-xl whitespace-nowrap shadow-xl">
                  <span className="font-black text-red-400 mr-1.5">{cp.timestamp}</span>
                  <span className="font-bold text-slate-100">{cp.title}</span>
                </div>
              </div>
            );
          })}

          {/* Current Track Head slider cursor handle pointer */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 pointer-events-none"
            style={{ left: `${progressPercentage}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-[3px] border-blue-600 shadow-lg" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
