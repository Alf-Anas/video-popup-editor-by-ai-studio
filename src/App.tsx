/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Sparkles, 
  Download, 
  Upload, 
  MonitorPlay, 
  Plus, 
  Info, 
  Eye, 
  Trash,
  Sliders, 
  MonitorUp, 
  Play,
  RotateCcw,
  Share2
} from 'lucide-react';

import { PopupCheckpoint } from './types';
import { DEFAULT_VIDEO, SAMPLE_POPUP_IMAGES } from './sampleData';
import CheckpointList from './components/CheckpointList';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import ExportModal from './components/ExportModal';
import { formatSecondsShort } from './utils/timeFormatter';

export default function App() {
  // Application Primary State
  const [userVideoUrl, setUserVideoUrl] = useState<string | null>(null);
  const [userVideoName, setUserVideoName] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_VIDEO.duration);
  const [isPlaying, setIsPlaying] = useState(false);

  // Ready-Made social media themed preset checkpoints for an out-of-the-box demo!
  const [checkpoints, setCheckpoints] = useState<PopupCheckpoint[]>([
    {
      id: 'social-cp-1',
      timestamp: '00:00:04',
      timeInSeconds: 4,
      imageUrl: SAMPLE_POPUP_IMAGES[0].url,
      imageName: SAMPLE_POPUP_IMAGES[0].name,
      duration: 3,
      title: 'Verified Creator Unlocked',
      description: 'Meet our featured guest creator of the month live on the drone set!',
      position: 'top-left'
    },
    {
      id: 'social-cp-2',
      timestamp: '00:00:10',
      timeInSeconds: 10,
      imageUrl: SAMPLE_POPUP_IMAGES[1].url,
      imageName: SAMPLE_POPUP_IMAGES[1].name,
      duration: 4,
      title: 'Trending Destination Active',
      description: 'Currently the number one searched summer spot of this week.',
      position: 'center'
    }
  ]);

  // Modal control
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Uploading custom video files
  const handleUserVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (userVideoUrl) {
        URL.revokeObjectURL(userVideoUrl);
      }
      const fileUrl = URL.createObjectURL(file);
      setUserVideoUrl(fileUrl);
      setUserVideoName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Temporary duration wait; the VideoPlayer loadedmetadata and alternate
      // events will update this accurately to the physical video length.
      setDuration(0); 
    }
  };

  // Reset custom video back to default template
  const handleResetToDefault = () => {
    if (userVideoUrl) {
      URL.revokeObjectURL(userVideoUrl);
    }
    setUserVideoUrl(null);
    setUserVideoName(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(DEFAULT_VIDEO.duration);
  };

  const handleAddCheckpoint = (newCP: Omit<PopupCheckpoint, 'id'>) => {
    const randomizedId = `cp-${Date.now()}`;
    const completeCP: PopupCheckpoint = {
      ...newCP,
      id: randomizedId
    };
    setCheckpoints((prev) => [...prev, completeCP]);
  };

  const handleDeleteCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((cp) => cp.id !== id));
  };

  const handleSeekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration || DEFAULT_VIDEO.duration));
    setCurrentTime(clamped);
  };

  // Drag and drop video upload
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (userVideoUrl) {
        URL.revokeObjectURL(userVideoUrl);
      }
      const fileUrl = URL.createObjectURL(file);
      setUserVideoUrl(fileUrl);
      setUserVideoName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="studio-workspace">
      
      {/* Visual Navigation Bar (Responsive Rounded Light Design) */}
      <header className="bg-white border-b border-slate-200 shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm" id="header-bar">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-blue-600 rounded-2xl shadow-md text-white shrink-0">
            <Share2 size={20} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>PopVid Studio</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-normal bg-blue-50 text-blue-600 border border-blue-100 px-2 sm:px-2.5 py-0.5 rounded-full select-none">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
              Create and preview video popups with pause effects
            </p>
          </div>
        </div>

        {/* Global Export Action */}
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setIsExportOpen(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-blue-200 active:scale-95 transition-all cursor-pointer shrink-0"
          id="global-compile-trigger"
        >
          <Download size={15} className="stroke-[2.5]" />
          <span>Export with Popups</span>
        </button>
      </header>

      {/* Main Studio Console Layout Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Video Player, Timeline controls, Drop targets (8 Column spans) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main Monitor Display */}
          <VideoPlayer
            template={DEFAULT_VIDEO}
            userVideoUrl={userVideoUrl}
            userVideoName={userVideoName}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            checkpoints={checkpoints}
            onSetDuration={(newVal) => {
              if (newVal > 0) {
                setDuration(newVal);
              }
            }}
            isPlaying={isPlaying}
            onSetIsPlaying={setIsPlaying}
          />

          {/* Interactive Scrub Timeline */}
          <Timeline
            duration={duration || DEFAULT_VIDEO.duration}
            currentTime={currentTime}
            checkpoints={checkpoints}
            onSeekTo={handleSeekTo}
          />

          {/* Video Control & Source upload Drawer */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Direct Information description */}
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-650">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-900">How it works:</span>
                <p className="text-slate-600 leading-relaxed">
                  Add moments with specific times using <strong>HH:MM:SS</strong> (e.g. 00:00:05). 
                  During playback, the video automatically pauses to display the custom popup card for a short period.
                  Clicking <strong>&quot;Resume Video&quot;</strong> or waiting out the countdown automatically resumes play at full speed.
                </p>
              </div>
            </div>

            {/* Custom file Uploader Zone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
                  <MonitorUp size={14} className="text-blue-600" />
                  Media Source Configuration
                </h3>
                {userVideoUrl && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Reset with default ocean clip
                  </button>
                )}
              </div>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[140px] ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/40' 
                    : userVideoUrl 
                      ? 'border-blue-200 bg-slate-50/50' 
                      : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleUserVideoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="user-file-picker"
                />

                <div className="space-y-2 pointer-events-none">
                  {userVideoUrl ? (
                    <div className="text-slate-800 space-y-1">
                      <div className="p-2.5 bg-blue-50 text-blue-650 rounded-full w-min mx-auto">
                        <MonitorPlay size={24} />
                      </div>
                      <p className="text-sm font-bold text-blue-600 truncate max-w-[320px]">
                        {userVideoName}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Drag or click another MP4 file to overwrite
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500">
                      <div className="p-2.5 bg-slate-50 text-slate-400 rounded-full w-min mx-auto">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Drag &amp; Drop custom video file here
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports local MP4, WebM (Any length triggers exact durations accurately)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Pane: Interactive popup register checkpoints list (4 columns span) */}
        <div className="lg:col-span-4 min-h-[460px]">
          <CheckpointList
            checkpoints={checkpoints}
            onAddCheckpoint={handleAddCheckpoint}
            onDeleteCheckpoint={handleDeleteCheckpoint}
            onSeekTo={handleSeekTo}
            videoDuration={duration || DEFAULT_VIDEO.duration}
          />
        </div>

      </main>

      {/* Render Exporter overlay modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        template={DEFAULT_VIDEO}
        userVideoUrl={userVideoUrl}
        checkpoints={checkpoints}
        duration={duration}
      />
    </div>
  );
}
