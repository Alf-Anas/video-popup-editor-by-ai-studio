/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Film, Loader2, Download, CheckCircle, PlaySquare, AlertCircle } from 'lucide-react';
import { PopupCheckpoint, VideoTemplate } from '../types';
import { formatSecondsShort } from '../utils/timeFormatter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: VideoTemplate;
  userVideoUrl: string | null;
  checkpoints: PopupCheckpoint[];
  duration: number;
}

export default function ExportModal({
  isOpen,
  onClose,
  template,
  userVideoUrl,
  checkpoints,
  duration,
}: ExportModalProps) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing Compiler...');
  const [compiledVideoUrl, setCompiledVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const activeVideoUrl = useMemo(() => {
    if (userVideoUrl) return userVideoUrl;
    return template.url;
  }, [userVideoUrl, template]);

  // Read current duration of baseline movie clip (fall back correctly to dynamic duration to fix the length bug)
  const totalOriginalDuration = duration || template.duration;
  
  // Calculate final total video duration including the paused seconds!
  const totalCompiledDuration = useMemo(() => {
    const pauseTally = checkpoints.reduce((sum, cp) => sum + cp.duration, 0);
    return totalOriginalDuration + pauseTally;
  }, [totalOriginalDuration, checkpoints]);

  const handleStartExport = async () => {
    setIsCompiling(true);
    setProgress(0);
    setCompiledVideoUrl(null);
    setErrorMsg(null);
    setStatusMessage('Preparing encoder stream...');

    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorMsg('Canvas rendering target missing.');
      setIsCompiling(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMsg('Could not initialize canvas graphics.');
      setIsCompiling(false);
      return;
    }

    // Set stable resolution for standard MP4/WebM exports
    canvas.width = 854;
    canvas.height = 480;

    // Retrieve canvas captures at stable 30 frames per second
    let stream: MediaStream;
    try {
      stream = canvas.captureStream(30);
    } catch (e) {
      setErrorMsg('Your browser blocks live stream capture from Canvas elements.');
      setIsCompiling(false);
      return;
    }

    // Mime types prioritized by browser standards
    const mimes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = '';
    let recorder: MediaRecorder | null = null;

    for (const mime of mimes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    if (!selectedMime) {
      setErrorMsg('No supported MediaRecorder video codec found on this browser.');
      setIsCompiling(false);
      return;
    }

    const chunks: Blob[] = [];
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 2500000 // 2.5 Mbps crisp detail
      });
    } catch (e) {
      setErrorMsg('Failed to instantiate MediaRecorder context.');
      setIsCompiling(false);
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const videoURL = URL.createObjectURL(blob);
      setCompiledVideoUrl(videoURL);
      setIsCompiling(false);
      setProgress(100);
      setStatusMessage('Compilation complete!');
    };

    // Pre-load images inside HTML contexts to prevent canvas flash-by issues
    setStatusMessage('Buffering story assets...');
    const loadedImages: { [id: string]: HTMLImageElement } = {};
    for (const cp of checkpoints) {
      const img = new Image();
      img.src = cp.imageUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          loadedImages[cp.id] = img;
          resolve(true);
        };
        img.onerror = () => {
          resolve(true);
        };
      });
    }

    // Start Recording
    recorder.start();

    let currentOriginalSeconds = 0;
    let totalCompiledSecondsPassed = 0;
    const fps = 30;
    const timeStep = 1 / fps; // advance by 1/30 seconds each frame

    // Build checkpoint map to capture precisely
    const sortedCheckpoints = [...checkpoints].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    const triggeredIds = new Set<string>();

    const drawFramePromise = () => {
      return new Promise<void>((resolve) => {
        const checkTick = async () => {
          // Check for active popup checkpoints that match this second
          const activePopup = sortedCheckpoints.find(
            cp => 
              Math.floor(cp.timeInSeconds) === Math.floor(currentOriginalSeconds) && 
              !triggeredIds.has(cp.id)
          );

          if (activePopup) {
            triggeredIds.add(activePopup.id);
            setStatusMessage(`Burning Overlay Card: "${activePopup.title}" (${activePopup.duration}s)...`);

            // Compile the frozen pause frame loop for checkpoint duration
            const totalPauseFrames = activePopup.duration * fps;
            for (let f = 0; f < totalPauseFrames; f++) {
              // 1. Draw baseline frozen video frame
              if (hiddenVideoRef.current) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(hiddenVideoRef.current, 0, 0, canvas.width, canvas.height);
              }

              // 2. Draw standard dark semi-transparent overlay blurring effect background
              ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // 3. Render Large Popup Card superimposition vectors with exact 12px padding from the video source bounds
              const max_W = canvas.width - 24; // 830
              const max_H = canvas.height - 24; // 456

              const loadedImg = loadedImages[activePopup.id];
              let cardW = 340;
              let cardH = 360;
              let imgAreaW = 308;
              let imgAreaH = 220;

              if (loadedImg) {
                const imgW = loadedImg.width || 300;
                const imgH = loadedImg.height || 200;
                const imgAspect = imgW / imgH;

                if (imgAspect < 1.0) {
                  // Portrait card layout
                  cardH = max_H; // perfectly 12px padding on top and bottom
                  const idealImgH = cardH - 100; // leaves 100px for structural paddings and texts
                  const idealImgW = idealImgH * imgAspect;
                  cardW = Math.max(320, Math.min(max_W, idealImgW + 32));
                  imgAreaW = cardW - 32;
                  imgAreaH = idealImgH;
                } else {
                  // Landscape card layout
                  cardW = max_W; // perfectly 12px padding on left and right
                  const idealImgW = cardW - 32;
                  const idealImgH = idealImgW / imgAspect;
                  cardH = Math.min(max_H, idealImgH + 100);
                  imgAreaW = cardW - 32;
                  imgAreaH = cardH - 100;
                }
              }

              // Draw beautiful canvas container card centering
              const xStart = (canvas.width - cardW) / 2;
              const yStart = (canvas.height - cardH) / 2;
              const borderRadius = 24;

              // Draw Pure White social styled rounded panel
              ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.roundRect(xStart, yStart, cardW, cardH, borderRadius);
              ctx.fill();
              ctx.stroke();

              // Draw image background wrapper box
              const imgAreaX = xStart + 16;
              const imgAreaY = yStart + 16;

              ctx.fillStyle = '#f8fafc';
              ctx.beginPath();
              ctx.roundRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH, 16);
              ctx.fill();

              if (loadedImg) {
                // Resize and fit image to standard area
                const imgW = loadedImg.width;
                const imgH = loadedImg.height;
                const ratio = Math.min((imgAreaW - 12) / imgW, (imgAreaH - 12) / imgH);
                const finalW = imgW * ratio;
                const finalH = imgH * ratio;

                ctx.drawImage(
                  loadedImg, 
                  imgAreaX + (imgAreaW - finalW) / 2, 
                  imgAreaY + (imgAreaH - finalH) / 2, 
                  finalW, 
                  finalH
                );
              } else {
                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 13px sans-serif';
                ctx.fillText('NO IMAGE ATTACHED', imgAreaX + imgAreaW / 2 - 65, imgAreaY + imgAreaH / 2);
              }

              // Text section below image (centered)
              const textYStart = imgAreaY + imgAreaH + 20;

              // Clean text wrap & positioning
              ctx.textAlign = 'center';

              ctx.font = 'bold 15px sans-serif';
              ctx.fillStyle = '#0f172a';
              ctx.fillText(activePopup.title.slice(0, 80), xStart + cardW / 2, textYStart);

              ctx.font = '11px sans-serif';
              ctx.fillStyle = '#64748b';
              const desc = activePopup.description;
              const maxChar = 100;
              let line1 = desc.slice(0, maxChar);
              let line2 = desc.slice(maxChar);
              if (line2.length > maxChar) line2 = line2.slice(0, maxChar) + '...';

              ctx.fillText(line1, xStart + cardW / 2, textYStart + 20);
              if (line2) {
                ctx.fillText(line2, xStart + cardW / 2, textYStart + 34);
              }

              ctx.textAlign = 'left'; // reset text alignment to default

              totalCompiledSecondsPassed += timeStep;
              setProgress(Math.round((totalCompiledSecondsPassed / totalCompiledDuration) * 98));

              // Frame compression wait
              await new Promise((r) => setTimeout(r, 6));
            }
          }

          // Advance baseline clip timeline
          if (currentOriginalSeconds < totalOriginalDuration) {
            if (hiddenVideoRef.current) {
              hiddenVideoRef.current.currentTime = currentOriginalSeconds;
              await new Promise((r) => {
                const onSeek = () => {
                  hiddenVideoRef.current?.removeEventListener('seeked', onSeek);
                  r(true);
                };
                hiddenVideoRef.current?.addEventListener('seeked', onSeek);
                setTimeout(r, 35);
              });

              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(hiddenVideoRef.current, 0, 0, canvas.width, canvas.height);
            }

            currentOriginalSeconds += timeStep;
            totalCompiledSecondsPassed += timeStep;
            setProgress(Math.min(99, Math.round((totalCompiledSecondsPassed / totalCompiledDuration) * 98)));
            setStatusMessage(`Processing frame: ${formatSecondsShort(currentOriginalSeconds)}...`);
            
            setTimeout(checkTick, 0);
          } else {
            resolve();
          }
        };

        checkTick();
      });
    };

    // Begin compilation sequence cleanly
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.currentTime = 0;
      await new Promise((resolve) => {
        const onLoaded = () => {
          hiddenVideoRef.current?.removeEventListener('canplaydata', onLoaded);
          resolve(true);
        };
        hiddenVideoRef.current?.addEventListener('canplaydata', onLoaded);
        setTimeout(resolve, 600); // fallback
      });
    }

    try {
      await drawFramePromise();
      setProgress(99);
      setStatusMessage('Wrapping final video containers...');
      setTimeout(() => {
        recorder?.stop();
      }, 300);
    } catch (e) {
      setErrorMsg('An error occurred during canvas overlay compiles.');
      setIsCompiling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="export-popup-overlay">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative border border-slate-100">
        
        {/* Header bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="text-blue-600" size={18} />
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">MP4 Compiler Output</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCompiling}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          
          {/* Info Details Panel */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex gap-4 items-start">
            <PlaySquare size={32} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs">
              <h3 className="font-extrabold text-slate-800">Video Integration Blueprint</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-[11px]">
                Your video clip will be compiled frame-by-frame. 
                All interactive paused moments are accurately burned directly into correct timelines.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-200">
                <div>Source duration: {formatSecondsShort(totalOriginalDuration)}</div>
                <div>Popup paused pauses: {formatSecondsShort(totalCompiledDuration - totalOriginalDuration)}</div>
                <div>Total length: {formatSecondsShort(totalCompiledDuration)}</div>
                <div className="text-blue-600">Codec format: WebM/MP4 (SD)</div>
              </div>
            </div>
          </div>

          {/* Compiler Progress Dashboard */}
          {isCompiling && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={14} />
                  {statusMessage}
                </span>
                <span className="text-blue-600 font-extrabold">{progress}%</span>
              </div>
              
              {/* Progress track */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 font-medium text-center">
                Keep the browser tab active while compiling story frames.
              </p>
            </div>
          )}

          {/* Failure Banner */}
          {errorMsg && (
            <div className="flex gap-3 bg-red-50 border border-red-105 p-4 rounded-xl items-start text-xs text-red-600">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold">Hardware Compilation Refusal</h4>
                <p className="text-[11px] text-red-500">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Download and Action Button block */}
          {!isCompiling && (
            <div className="space-y-4">
              {compiledVideoUrl ? (
                // Success block
                <div className="space-y-4 text-center py-4 bg-green-50 rounded-2xl border border-green-100">
                  <CheckCircle size={36} className="mx-auto text-green-600" />
                  <div className="space-y-1 px-4">
                    <h4 className="text-green-800 font-extrabold text-sm uppercase">Video ready for download!</h4>
                    <p className="text-xs text-green-650 font-medium">All interactive story pauses and badges have been burned in successfully.</p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={compiledVideoUrl}
                      download="interactive_story_popup.mp4"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-6 rounded-full shadow-lg hover:shadow-blue-200 transition-all cursor-pointer"
                    >
                      <Download size={14} className="stroke-[2.5]" />
                      Download Video Package
                    </a>
                  </div>
                </div>
              ) : (
                // Initial prompt
                <button
                  type="button"
                  onClick={handleStartExport}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Film size={14} />
                  Render &amp; Compile Story
                </button>
              )}
            </div>
          )}

          {/* Hidden utilities for rendering canvas process frames */}
          <div className="hidden">
            <canvas ref={canvasRef} />
            {activeVideoUrl && (
              <video
                ref={hiddenVideoRef}
                src={activeVideoUrl}
                crossOrigin="anonymous"
                muted
                playsInline
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
