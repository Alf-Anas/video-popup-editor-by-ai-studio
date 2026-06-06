# PopVid Studio - Remix: Video Popup Editor

An interactive HTML5 video overlay editor and client-side media encoder. **PopVid Studio** empowers creators to add engaging, interactive visual popup cards (checkpoints) at precise timestamps, auto-pause playback dynamically during stream previews, and compile/export finished videos with burned-in overlays directly from their web browser.

---

## 🚀 Key Features

- **Interactive Timed Checkpoints**: Add, delete, and configure text, titles, image cards, and custom badges at high-precision millisecond intervals along the video timeline.
- **Smart Auto-Pause Engine**: When playback reaches a checkpoint timestamp, the stream dynamically pauses, zooms, and transitions a stylish social popup overlay card with a blur-backdrop backdrop effect. Once the configured duration ends, playback resumes.
- **Pre-Built Visual Presets**: Ships with high-quality themed SVGs out-of-the-box (e.g., *Verified Creator Card*, *Hot Story Badge*, *Travel Spot Badge*) for an instant interactive playground experience.
- **Pure Client-Side Video Encoder**: Utilizes standard HTML5 Canvas 2D rasterization, frame-by-frame canvas rendering pipelines, and the browser's native `MediaRecorder` API to render and encode overlays into a high-fidelity downloadable video—without sending any bandwidth data to backend servers.
- **Social-First Responsive Layout**: Frame-perfect UI engineered with Tailwind CSS, custom-tuned timeline controls, and smooth interactive entering transitions powered by `motion`.
- **Custom Media Uploads**: Supports local video file importing (drag-and-drop or explicit file selector) to easily edit and overlay custom MP4 or WebM streams.

---

## 🛠️ The Technical Architecture

### 1. Canvas Vector Projection
During preview generation, the editor overlays standard React components perfectly within the player bounding box. When initiating the compile/render phase:
- Target resolution is locked to optimal browser dimensions (854x480).
- Baseline video frames are written directly onto an offscreen HTML5 `<canvas>` element at 30 frames per second using microsecond-accurate loop iteration.
- A custom layout algorithm centers and renders white card blocks, images, SVG content, and multi-line wrapped text labels safely within safe zones.

### 2. Client-Side Video Compiling (`MediaRecorder`)
- The canvas output is routed straight into a local browser stream: `canvas.captureStream(30)`.
- It dynamically chooses the most optimal support standard between `video/webm;codecs=vp9`, `video/webm;codecs=vp8`, or `video/mp4` to balance speed and compression quality.
- The encoder stream burns the exact freeze-frame overlays directly for their specified duration, before unfreezing the underlying timeline to keep audio/video in perfect synchronization.

---

## 📋 How To Use

1. **Import your Video**: Drag and drop any `.mp4`/`.webm` file into the editor, or click **Upload Custom Video**. You can also click **Reset to Default** at any time to return to the preset coast drone cinematic template.
2. **Setup Interactive Popups**: 
   - Position the timeline pointer at a desired point.
   - Click **Add Checkpoint** on the right side.
   - Provide a *Title*, *Description*, *Duration (seconds)*, adjust the overlay position, and select an icon or upload a custom image.
3. **Preview Playback**: Play the video stream. Note how the video naturally suspends when hitting target seconds, displays your custom badge, and proceeds after the timeout!
4. **Compile & Export**: Click **Export with Popups** in the upper-right corner. Hit **Render & Compile Story** in the popup controller to watch the frame-by-frame compilation. Once done, a **Download Video Package** link appears to save your finished social video asset!

---

## 💻 Tech Stack & Dependencies

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Vite 6.x
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)

---

## 🔨 Local Setup & Development

Ensure you have **Node.js** (v18+) installed, then run:

```bash
# Install package dependencies
npm install

# Live development server with hot reload
npm run dev

# Compile fully optimized production assets
npm run build

# Type check the TypeScript implementation
npm run lint
```
