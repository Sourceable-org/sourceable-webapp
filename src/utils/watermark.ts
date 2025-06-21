import { reverseGeocode } from './gps';

interface WatermarkOptions {
  logoUrl: string;
  verificationUrl: string;
  gpsPrecision?: 'exact' | '5mile' | '10mile' | '20mile';
  gpsRadiusMiles?: number;
  gpsLat?: number;
  gpsLng?: number;
  timestamp: string;
}

const drawWatermark = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  logo: HTMLImageElement,
  options: WatermarkOptions,
  locationText: string
) => {
  // --- Styling ---
  const startX = canvas.width * 0.04;
  const pad = canvas.width * 0.02;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.6;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  let currentY = canvas.height - pad * 1.5;

  // --- Draw Elements from Bottom to Top ---

  // 1. Timestamp
  const timestampFont = `bold ${canvas.width * 0.022}px Arial`;
  ctx.font = timestampFont;
  ctx.fillText(options.timestamp, startX, currentY);
  currentY -= (canvas.width * 0.03);

  // 2. Location
  if (locationText) {
    const locationFont = `bold ${canvas.width * 0.03}px Arial`;
    ctx.font = locationFont;
    ctx.fillText(locationText, startX, currentY);
    currentY -= (canvas.width * 0.04);
  }

  // 3. Logo and Brand Name
  const logoHeight = canvas.width * 0.06;
  const brandFont = `bold ${logoHeight * 0.95}px Arial`;
  ctx.font = brandFont;
  
  // Vertically align logo and text
  const brandY = currentY - logoHeight / 2;
  ctx.drawImage(logo, startX, brandY - logoHeight / 2, logoHeight, logoHeight);
  ctx.textBaseline = 'middle';
  const textX = startX + logoHeight + (canvas.width * 0.015);
  ctx.fillText('SOURCEABLE', textX, brandY);
  currentY -= (logoHeight + pad);
  
  // 4. Verification URL
  ctx.textBaseline = 'alphabetic'; // Reset baseline
  const urlFont = `${canvas.width * 0.02}px Arial`;
  ctx.font = urlFont;
  const displayUrl = options.verificationUrl.replace(/^(https?:\/\/)/, '');
  ctx.fillText(displayUrl, startX, currentY);
};

export const addWatermark = async (
  imageUrl: string,
  options: WatermarkOptions
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let locationText = '';
      if (options.gpsLat != null && options.gpsLng != null) {
        try {
          locationText = await reverseGeocode(options.gpsLat, options.gpsLng);
        } catch {
          locationText = `${options.gpsLat.toFixed(4)}°, ${options.gpsLng.toFixed(4)}°`;
        }
      }

      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = options.logoUrl;

      logo.onload = () => {
        drawWatermark(ctx, canvas, logo, options, locationText);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      logo.onerror = () => reject(new Error('Failed to load logo'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
};

export const addVideoWatermark = async (
  videoUrl: string,
  options: WatermarkOptions
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;

    video.oncanplay = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not found'));

      // size canvas
      const vw = video.videoWidth, vh = video.videoHeight;
      let cw = 800, ch = cw * (vh / vw);
      if (ch > 600) {
        ch = 600;
        cw = ch * (vw / vh);
      }
      canvas.width = cw;
      canvas.height = ch;

      const stream = canvas.captureStream();
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(video);
      src.connect(dest);
      const combined = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combined, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => resolve(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })));
      recorder.start();

      let locationText = '';
      if (options.gpsLat != null && options.gpsLng != null) {
        try {
          locationText = await reverseGeocode(options.gpsLat, options.gpsLng);
        } catch {
          locationText = `${options.gpsLat.toFixed(4)}°, ${options.gpsLng.toFixed(4)}°`;
        }
      }

      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = options.logoUrl;

      logo.onload = () => {
        const drawFrame = () => {
          if (video.paused || video.ended) {
            if (recorder.state === 'recording') recorder.stop();
            return;
          }

          ctx.drawImage(video, 0, 0, cw, ch);
          drawWatermark(ctx, canvas, logo, options, locationText);
          requestAnimationFrame(drawFrame);
        };
        video.play();
        drawFrame();
      };
      logo.onerror = () => reject(new Error('Failed to load logo'));
    };
    video.onerror = e => reject(e);
  });
};
