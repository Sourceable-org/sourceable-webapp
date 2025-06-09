interface WatermarkOptions {
  logoUrl: string;
  verificationUrl: string;
  gpsPrecision?: 'exact' | '5mile' | '10mile' | '20mile';
  gpsRadiusMiles?: number;
  gpsLat?: number;  // Added
  gpsLng?: number;  // Added
  timestamp: string;
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
      
      const footerHeight = 80;
      canvas.width = img.width;
      canvas.height = img.height + footerHeight;
      
      ctx.drawImage(img, 0, 0);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, img.height, canvas.width, footerHeight);
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoHeight = 60;
        const logoWidth = logoHeight * 2;
        const logoX = 20;
        const logoY = img.height + (footerHeight - logoHeight) / 2;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        const lines = [
          options.verificationUrl,
          options.timestamp,
          `Approx. Coordinates: ${options.gpsLat?.toFixed(5)}, ${options.gpsLng?.toFixed(5)}`
        ];
        
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
      
      const stream = canvas.captureStream();
      
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
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(0, height, width, footerHeight);
          
          const logoHeight = 60;
          const logoWidth = logoHeight * 2;
          const logoX = 20;
          const logoY = height + (footerHeight - logoHeight) / 2;
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
          
          const lines = [
            options.verificationUrl,
            options.timestamp,
            `Approx. Coordinates: ${options.gpsLat?.toFixed(5)}, ${options.gpsLng?.toFixed(5)}`
          ];
          
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

