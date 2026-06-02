/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function drawSyntheticFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  type: 'satellite' | 'highway'
) {
  // Clear with subtle futuristic grid
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Draw Grid background
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const pulse = Math.sin(time * 3);
  const slowPulse = Math.sin(time * 0.5);

  if (type === 'satellite') {
    // 1. Draw Satellite Reticle Scope
    const cx = width / 2;
    const cy = height / 2;

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, 180 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.beginPath();
    ctx.moveTo(cx - 220, cy);
    ctx.lineTo(cx + 220, cy);
    ctx.moveTo(cx, cy - 220);
    ctx.lineTo(cx, cy + 220);
    ctx.stroke();

    // Dotted Ring
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 140, time * 0.2, time * 0.2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // 2. Moving Tracking Targets
    const targets = [
      { id: 'TGT-ALPHA', xOffset: 120, yOffset: 80, speedX: 0.1, speedY: 0.15, col: '#ef4444' },
      { id: 'TGT-BETA', xOffset: -160, yOffset: -50, speedX: -0.08, speedY: 0.12, col: '#f97316' },
      { id: 'TGT-OMEGA', xOffset: -20, yOffset: 110, speedX: 0.14, speedY: -0.07, col: '#3b82f6' }
    ];

    targets.forEach((tgt) => {
      const rx = cx + tgt.xOffset + Math.sin(time * tgt.speedX) * 150;
      const ry = cy + tgt.yOffset + Math.cos(time * tgt.speedY) * 100;

      // Target Bounding Box
      ctx.strokeStyle = tgt.col;
      ctx.lineWidth = 1.5;
      const bSize = 34 + Math.sin(time * 5) * 2;
      
      // Corners
      ctx.beginPath();
      // Top left
      ctx.moveTo(rx - bSize, ry - bSize + 10);
      ctx.lineTo(rx - bSize, ry - bSize);
      ctx.lineTo(rx - bSize + 10, ry - bSize);
      // Top right
      ctx.moveTo(rx + bSize - 10, ry - bSize);
      ctx.lineTo(rx + bSize, ry - bSize);
      ctx.lineTo(rx + bSize, ry - bSize + 10);
      // Bottom left
      ctx.moveTo(rx - bSize, ry + bSize - 10);
      ctx.lineTo(rx - bSize, ry + bSize);
      ctx.lineTo(rx - bSize + 10, ry + bSize);
      // Bottom right
      ctx.moveTo(rx + bSize - 10, ry + bSize);
      ctx.lineTo(rx + bSize, ry + bSize);
      ctx.lineTo(rx + bSize, ry + bSize - 10);
      ctx.stroke();

      // Label text
      ctx.fillStyle = tgt.col;
      ctx.font = '10px monospace';
      ctx.fillText(`${tgt.id}`, rx + bSize + 6, ry - bSize / 2);
      ctx.fillText(`X:${Math.floor(rx)} Y:${Math.floor(ry)}`, rx + bSize + 6, ry - bSize / 2 + 12);
      ctx.fillText(`VEL:${(3.2 + Math.cos(time * 0.1) * 0.5).toFixed(2)} mach`, rx + bSize + 6, ry - bSize / 2 + 24);

      // Simple dot target paths
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(rx, ry, bSize - 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Outer Overlay HUD Texts
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('SATELLITE ORBITAL ACQUISITION', 30, 40);
    ctx.font = '10px monospace';
    ctx.fillText('SYS_LOC: LEO_ORBIT_288', 30, 56);
    ctx.fillText(`COORD: 34°03'N, 118°15'W`, 30, 70);
    ctx.fillText(`FPS: 30.00`, 30, 84);

    // Dynamic graph lines
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) {
      const gx = 30 + i * 3;
      const gy = 150 + Math.sin(time * 2 + i * 0.2) * 20;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();
    ctx.fillText('SIGNAL INTEGRITY', 30, 120);

    // Current system time
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`● CAPTURE REPL`, width - 150, 40);
    ctx.fillStyle = '#22c55e';
    
    // Convert current video seconds to formatted time
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
    ctx.fillText(`TIME: ${timeFormatted}`, width - 150, 56);
    ctx.fillText(`AZIMUTH: ${(184.2 + time * 1.5).toFixed(1)}°`, width - 150, 70);

  } else if (type === 'highway') {
    // 2. Highway Tracker Visuals
    const cx = width / 2;
    const cy = height / 2;

    // Draw Perspective Lanes
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 200, height);
    ctx.lineTo(cx - 30, cy - 100);
    ctx.moveTo(cx + 200, height);
    ctx.lineTo(cx + 30, cy - 100);
    ctx.stroke();

    // Dashboard center divider markers
    ctx.setLineDash([15, 25]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx, height);
    ctx.lineTo(cx, cy - 100);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Speed Highway Drone HUD
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('AUTONOMOUS HIGHWAY RECON', 30, 40);
    ctx.fillRect(30, 48, 180, 2);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    ctx.fillText('SENSOR DETECT: LIDAR_ACTIVE', 30, 64);
    ctx.fillText(`RANGE INDICATOR: (150m)`, 30, 78);

    // Synthed Vector Cars moving down the lanes
    const cars = [
      { id: 'CAR-098', lane: -1, startZ: 2.5, speed: 0.3, len: 120, col: '#3b82f6' },
      { id: 'CAR-241', lane: 1, startZ: 1.2, speed: 0.42, len: 110, col: '#f43f5e' },
      { id: 'CAR-115', lane: -1, startZ: 0.4, speed: 0.35, len: 100, col: '#10b981' }
    ];

    cars.forEach((car) => {
      // Calculate depth Z wrap
      const z = ((time * car.speed + car.startZ) % 3);
      if (z < 0.2) return; // Behind or too far away

      const scale = 1 / z;
      const vx = cx + car.lane * 140 * scale;
      const vy = cy + 40 + 80 * scale;

      const w = 50 * scale;
      const h = 30 * scale;

      if (vy > height || vy < 0) return;

      // Draw bounding box
      ctx.strokeStyle = car.col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vx - w / 2, vy - h / 2, w, h);

      // Fill transparent
      ctx.fillStyle = `${car.col}1a`; // 10% opacity
      ctx.fillRect(vx - w / 2, vy - h / 2, w, h);

      // Speed info text
      ctx.fillStyle = car.col;
      ctx.font = `${Math.max(8, Math.floor(8 * scale))}px monospace`;
      ctx.fillText(`${car.id}`, vx - w / 2, vy - h / 2 - 12);
      ctx.fillText(`${(car.len + Math.sin(time * 4) * 2).toFixed(0)} km/h`, vx - w / 2, vy - h / 2 - 3);

      // Drone radar line down to lane
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx, cy - 80);
      ctx.stroke();
    });

    // Altitude & Speed meters
    ctx.fillStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.fillRect(width - 120, 100, 15, 120);
    ctx.fillStyle = '#3b82f6';
    const altFill = 40 + Math.sin(time) * 30;
    ctx.fillRect(width - 120, 100 + (120 - altFill), 15, altFill);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('ALT: 840m', width - 118, 90);
    ctx.fillText('DNR-3', width - 118, 235);
  }
}
