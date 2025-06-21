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
    video.muted = false; // Don't mute the video for audio processing

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

      // Get video stream from canvas
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Create audio context and connect video audio
      const audioCtx = new AudioContext();
      const audioSource = audioCtx.createMediaElementSource(video);
      const audioDestination = audioCtx.createMediaStreamDestination();
      
      // Connect audio source to destination
      audioSource.connect(audioDestination);
      
      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);

      // Check if we have audio tracks
      const hasAudio = combinedStream.getAudioTracks().length > 0;
      console.log('Watermark processing - Audio tracks found:', hasAudio, combinedStream.getAudioTracks().length);

      // Check for supported MIME types for recording
      const supportedTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let selectedMimeType = null;
      for (const mimeType of supportedTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Watermark using MIME type:', mimeType);
          break;
        }
      }
      
      if (!selectedMimeType) {
        reject(new Error('No supported video MIME type found for watermarking'));
        return;
      }

      const recorder = new MediaRecorder(combinedStream, { 
        mimeType: selectedMimeType,
        videoBitsPerSecond: 1000000,
        audioBitsPerSecond: 128000
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType });
        console.log('Watermarked video blob size:', blob.size, 'bytes');
        console.log('Watermarked video blob type:', blob.type);
        resolve(URL.createObjectURL(blob));
      };
      
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
            if (recorder.state === 'recording') {
              recorder.stop();
            }
            return;
          }

          ctx.drawImage(video, 0, 0, cw, ch);
          drawWatermark(ctx, canvas, logo, options, locationText);
          requestAnimationFrame(drawFrame);
        };
        
        // Start playing the video to begin recording
        video.play().catch(err => {
          console.error('Failed to play video:', err);
          reject(err);
        });
        
        drawFrame();
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
    };
    
    video.onerror = e => reject(e);
  });
};
