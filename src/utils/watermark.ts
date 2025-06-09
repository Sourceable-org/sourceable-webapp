interface WatermarkOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
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
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Configure watermark text
      ctx.font = `${options.fontSize || 24}px ${options.fontFamily || 'Arial'}`;
      ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.7)';
      ctx.globalAlpha = options.opacity || 0.7;
      
      // Calculate text dimensions
      const textMetrics = ctx.measureText(options.text);
      const textWidth = textMetrics.width;
      const textHeight = options.fontSize || 24;
      
      // Calculate position
      let x: number;
      let y: number;
      const padding = 20;
      
      switch (options.position || 'bottom-right') {
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case 'top-left':
          x = padding;
          y = textHeight + padding;
          break;
        default:
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
      }
      
      // Draw watermark text
      ctx.fillText(options.text, x, y);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.9));
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
      
      // Calculate scaled dimensions (max 720p)
      const maxWidth = 1280;
      const maxHeight = 720;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      // Set canvas dimensions to scaled size
      canvas.width = width;
      canvas.height = height;
      
      // Create a MediaRecorder to capture the watermarked video
      const stream = canvas.captureStream();
      
      // Get the audio track from the original video
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      const audioSource = audioContext.createMediaElementSource(video);
      audioSource.connect(audioDestination);
      
      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 1000000, // 1 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Draw frames with watermark
      const drawFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop();
          return;
        }
        
        // Draw video frame scaled to canvas size
        ctx.drawImage(video, 0, 0, width, height);
        
        // Configure watermark text
        const fontSize = Math.max(16, Math.floor(height * 0.03)); // Scale font size with video height
        ctx.font = `${fontSize}px ${options.fontFamily || 'Arial'}`;
        ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.7)';
        ctx.globalAlpha = options.opacity || 0.7;
        
        // Calculate text dimensions
        const textMetrics = ctx.measureText(options.text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Calculate position
        let x: number;
        let y: number;
        const padding = Math.max(10, Math.floor(height * 0.02)); // Scale padding with video height
        
        switch (options.position || 'bottom-right') {
          case 'bottom-right':
            x = width - textWidth - padding;
            y = height - padding;
            break;
          case 'bottom-left':
            x = padding;
            y = height - padding;
            break;
          case 'top-right':
            x = width - textWidth - padding;
            y = textHeight + padding;
            break;
          case 'top-left':
            x = padding;
            y = textHeight + padding;
            break;
          default:
            x = width - textWidth - padding;
            y = height - padding;
        }
        
        // Draw watermark text
        ctx.fillText(options.text, x, y);
        
        // Request next frame
        requestAnimationFrame(drawFrame);
      };
      
      // Start playing the video
      video.play();
      drawFrame();
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
}; 