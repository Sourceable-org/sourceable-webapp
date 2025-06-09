import { formatCoordinates, formatApproxCoordinates } from './gps';

interface WatermarkOptions {
  logoUrl: string;
  verificationUrl: string;
  gpsPrecision?: 'exact' | '5mi' | '10mi' | '20mi';
  gpsRadiusMiles?: number;
  timestamp: string;
  gpsLat: number;
  gpsLng: number;
}

export const addWatermark = async (
  imageUrl: string,
  options: WatermarkOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set canvas dimensions to match image plus footer
      const footerHeight = 80;
      canvas.width = img.width;
      canvas.height = img.height + footerHeight;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Draw footer background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, img.height, canvas.width, footerHeight);
      
      // Load logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        // Draw logo
        const logoHeight = 60;
        const logoWidth = logoHeight * 2;
        const logoX = 20;
        const logoY = img.height + (footerHeight - logoHeight) / 2;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        // Prepare text lines
        const lines = [
          options.verificationUrl,
          options.timestamp,
          options.gpsPrecision === 'exact'
            ? `Location: ${formatCoordinates(options.gpsLat, options.gpsLng, 'exact')}`
            : `Location: ${formatApproxCoordinates(options.gpsLat, options.gpsLng)} (within ${options.gpsRadiusMiles} mile radius)`
        ];
        
        // Draw text
        const fontSize = 14;
        const lineHeight = fontSize * 1.4;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textX = logoX + logoWidth + 20;
        let textY = img.height + 30;
        
        lines.forEach(line => {
          ctx.fillText(line, textX, textY);
          textY += lineHeight;
        });
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      logo.onerror = () => {
        reject(new Error('Failed to load logo'));
      };
      
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

export const addVideoWatermark = async (
  videoUrl: string,
  options: WatermarkOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Calculate scaled dimensions
      const maxWidth = 1280;
      const maxHeight = 720;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      const footerHeight = 80;
      canvas.width = width;
      canvas.height = height + footerHeight;
      
      // Capture stream
      const stream = canvas.captureStream();
      
      // Audio setup
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      const audioSource = audioContext.createMediaElementSource(video);
      audioSource.connect(audioDestination);
      
      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 1000000,
        audioBitsPerSecond: 128000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      
      mediaRecorder.start();
      
      // Load logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          
          // Draw video frame
          ctx.drawImage(video, 0, 0, width, height);
          
          // Draw footer background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(0, height, width, footerHeight);
          
          // Draw logo
          const logoHeight = 60;
          const logoWidth = logoHeight * 2;
          const logoX = 20;
          const logoY = height + (footerHeight - logoHeight) / 2;
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
          
          // Prepare text lines
          const lines = [
            options.verificationUrl,
            options.timestamp,
            options.gpsPrecision === 'exact'
              ? `Location: ${formatCoordinates(options.gpsLat, options.gpsLng, 'exact')}`
              : `Location: ${formatApproxCoordinates(options.gpsLat, options.gpsLng)} (within ${options.gpsRadiusMiles} mile radius)`
          ];
          
          // Draw text
          const fontSize = 14;
          const lineHeight = fontSize * 1.4;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const textX = logoX + logoWidth + 20;
          let textY = height + 30;
          
          lines.forEach(line => {
            ctx.fillText(line, textX, textY);
            textY += lineHeight;
          });
          
          requestAnimationFrame(drawFrame);
        };
        
        video.play();
        drawFrame();
      };
      
      logo.onerror = () => {
        reject(new Error('Failed to load logo'));
      };
      
      logo.src = options.logoUrl;
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
};
