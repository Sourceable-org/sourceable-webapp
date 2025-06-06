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