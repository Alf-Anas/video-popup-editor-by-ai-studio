/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash, Image as ImageIcon, Sparkles, Clock, Upload, AlertCircle, Eye } from 'lucide-react';
import { PopupCheckpoint, PopupPosition } from '../types';
import { SAMPLE_POPUP_IMAGES } from '../sampleData';
import { formatSecondsShort, parseTimeToSeconds, isValidTimeFormat, formatSecondsToHHMMSS } from '../utils/timeFormatter';

interface CheckpointListProps {
  checkpoints: PopupCheckpoint[];
  onAddCheckpoint: (checkpoint: Omit<PopupCheckpoint, 'id'>) => void;
  onDeleteCheckpoint: (id: string) => void;
  onSeekTo: (seconds: number) => void;
  videoDuration: number;
}

export default function CheckpointList({
  checkpoints,
  onAddCheckpoint,
  onDeleteCheckpoint,
  onSeekTo,
  videoDuration,
}: CheckpointListProps) {
  // Input fields
  const [timeInput, setTimeInput] = useState('00:00:05');
  const [selectedPresetImage, setSelectedPresetImage] = useState(SAMPLE_POPUP_IMAGES[0].id);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [duration, setDuration] = useState(3);
  const [title, setTitle] = useState('Trending Topic Alert');
  const [description, setDescription] = useState('Check out this amazing spotlight detail!');
  const [position, setPosition] = useState<PopupPosition>('center');
  
  // Validation status
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setUseCustomImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    // 1. Validate time format
    if (!isValidTimeFormat(timeInput)) {
      setValidationError('Use format HH:MM:SS or HHmmss (e.g., 00:00:15 or 000015)');
      return;
    }

    const seconds = parseTimeToSeconds(timeInput);
    
    // Check bounds strictly
    if (seconds < 0 || (videoDuration > 0 && seconds > videoDuration)) {
      setValidationError(`Timestamp must be between 0 and video length (${formatSecondsShort(videoDuration)})`);
      return;
    }

    // 2. Resolve image data
    let imageUrl = '';
    let imageName = '';

    if (useCustomImage && customImageBase64) {
      imageUrl = customImageBase64;
      imageName = 'Custom Upload';
    } else {
      const preset = SAMPLE_POPUP_IMAGES.find(i => i.id === selectedPresetImage);
      imageUrl = preset ? preset.url : SAMPLE_POPUP_IMAGES[0].url;
      imageName = preset ? preset.name : SAMPLE_POPUP_IMAGES[0].name;
    }

    // 3. Trigger callback to App state
    onAddCheckpoint({
      timestamp: formatSecondsToHHMMSS(seconds),
      timeInSeconds: seconds,
      imageUrl,
      imageName,
      duration,
      title: title.trim() || 'Spotlight Alert',
      description: description.trim() || 'No description provided.',
      position,
    });

    // Clear validation and provide a gentle offset advance
    setValidationError(null);
    
    const nextSeconds = Math.min(seconds + 5, videoDuration || 15);
    setTimeInput(formatSecondsToHHMMSS(nextSeconds));
    setTitle('Story Sparkle Keyframe');
    setDescription('Featured moment pause is successfully locked.');
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm" id="checkpoint-sidebar">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          Configured Popups
        </h2>
        <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          {checkpoints.length} ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white">
        
        {/* Creator Section */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150/70 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
            Create Custom Popup
          </h3>
          
          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Trigger Time (HH:MM:SS)</label>
            <div className="relative">
              <input
                type="text"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. 00:00:08"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                id="time-selector-input"
              />
              <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">
                ~ {formatSecondsShort(parseTimeToSeconds(timeInput))}
              </span>
            </div>
          </div>

          {/* Preset image vs Custom File upload toggler */}
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Popup Imagery</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUseCustomImage(false)}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !useCustomImage 
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Stock Badges
              </button>
              <button
                type="button"
                onClick={() => setUseCustomImage(true)}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  useCustomImage 
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File
              </button>
            </div>

            {/* Presets Grid */}
            {!useCustomImage ? (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {SAMPLE_POPUP_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetImage(img.id);
                      if (img.id === 'verified-badge') {
                        setTitle('Verified Story Creator');
                        setDescription('Check out the awesome profile validation!');
                      } else if (img.id === 'trending-fire') {
                        setTitle('Trending Challenge Hot');
                        setDescription('Currently receiving over 50k interactions!');
                      } else {
                        setTitle('Travel Passport Pin');
                        setDescription('Discover details about this relaxing coast getaway.');
                      }
                    }}
                    className={`group relative aspect-[4/3] rounded-xl border overflow-hidden bg-slate-50 transition-all cursor-pointer ${
                      selectedPresetImage === img.id
                        ? 'border-blue-500 ring-4 ring-blue-100'
                        : 'border-slate-150 hover:border-slate-350'
                    }`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            ) : (
              // Custom image target
              <div className="relative group pt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="custom-img-uploader"
                />
                <div className="border border-dashed border-slate-200 group-hover:border-slate-300 rounded-xl p-4 text-center bg-white transition-colors">
                  {customImageBase64 ? (
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-10 h-8 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                        <img 
                          src={customImageBase64} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-green-600 truncate max-w-[125px]">
                        Custom Image Attached
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload size={18} className="mx-auto text-slate-400" />
                      <p className="text-[11px] text-slate-500 font-bold">
                        Choose picture file to mount
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Config Detail inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Pause duration</label>
              <input
                type="number"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Screen overlay</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PopupPosition)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-slate-300 cursor-pointer focus:border-blue-500"
              >
                <option value="center">Center Card</option>
                <option value="top-left">Top-Left Banner</option>
                <option value="top-right">Top-Right Info</option>
                <option value="bottom-left">Bottom-Left Info</option>
                <option value="bottom-right">Bottom-Right Info</option>
              </select>
            </div>
          </div>

          {/* Custom Text inputs */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Popup title</label>
              <input
                type="text"
                placeholder="Story Spotlight"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Popup description</label>
              <textarea
                placeholder="Write subtitle detail copy here..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="flex gap-2 items-center text-red-650 text-xs bg-red-50 border border-red-100 p-2.5 rounded-xl leading-relaxed animate-fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Add checkpoint trigger */}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md hover:shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
            id="add-checkpoint-button"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Insert Interactive Keyframe</span>
          </button>
        </div>

        {/* Existing checkpoints list */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
            Active Keyframe Timestamps ({checkpoints.length})
          </h3>
          {checkpoints.length === 0 ? (
            <div className="text-center p-8 border border-slate-100 rounded-2xl text-slate-450 text-xs font-medium space-y-1.5 bg-slate-50/50">
              <ImageIcon className="mx-auto text-slate-350" size={20} />
              <p>No popups added to this video yet.</p>
              <p className="text-[10px] text-slate-400 font-normal">Use the creator card above to begin embedding</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {checkpoints
                .slice()
                .sort((a, b) => a.timeInSeconds - b.timeInSeconds)
                .map((cp) => (
                  <div
                    key={cp.id}
                    className="group bg-white p-3.5 rounded-2xl border border-slate-150 hover:border-blue-200 hover:shadow-md hover:shadow-slate-100 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex gap-3 items-start min-w-0">
                      {/* Image Preview Box */}
                      <div className="relative w-12 h-9 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        <img 
                          src={cp.imageUrl} 
                          alt={cp.title} 
                          className="w-full h-full object-contain p-0.5" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Metadata Labels */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {cp.timestamp}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {cp.duration}s hold
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 mt-1 truncate">
                          {cp.title}
                        </h4>
                        <p className="text-[10px] font-medium text-slate-550 truncate leading-normal">
                          {cp.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Trigger seeking & deletions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onSeekTo(cp.timeInSeconds)}
                        title="Seek Player to Timestamp"
                        className="p-1 px-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors cursor-pointer"
                      >
                        <Eye size={12} className="inline mr-0.5" />
                        <span className="text-[10px] font-extrabold">Seek</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCheckpoint(cp.id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-full transition-colors cursor-pointer"
                        title="Remove Keyframe"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
