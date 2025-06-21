interface WatermarkDesignOptions {
  logoUrl: string;
  verificationUrl: string;
  timestamp: string;
  location: string;
  gpsLat?: number;
  gpsLng?: number;
}

// Design 1: Diagonal Watermark with Logo
export const createDiagonalWatermark = async (
  imageUrl: string,
  options: WatermarkDesignOptions
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
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Create diagonal watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // -30 degrees
      
      // Semi-transparent background for diagonal watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-canvas.width / 2, -50, canvas.width, 100);
      
      // Sourceable text in diagonal
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('SOURCEABLE', 0, 10);
      
      ctx.restore();
      
      // Add footer with details
      const footerHeight = 80;
      const footerCanvas = document.createElement('canvas');
      const footerCtx = footerCanvas.getContext('2d');
      
      if (!footerCtx) {
        reject(new Error('Could not get footer canvas context'));
        return;
      }
      
      footerCanvas.width = canvas.width;
      footerCanvas.height = footerHeight;
      
      footerCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      footerCtx.fillRect(0, 0, footerCanvas.width, footerHeight);
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoHeight = 60;
        const logoWidth = logoHeight * 2;
        const logoX = 20;
        const logoY = (footerHeight - logoHeight) / 2;
        footerCtx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        const lines = [
          options.verificationUrl,
          options.timestamp,
          options.location
        ];
        
        const fontSize = 14;
        const lineHeight = fontSize * 1.4;
        footerCtx.font = `${fontSize}px Arial`;
        footerCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textX = logoX + logoWidth + 20;
        let textY = 30;
        
        lines.forEach(line => {
          footerCtx.fillText(line, textX, textY);
          textY += lineHeight;
        });
        
        // Combine main image with footer
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        
        if (!finalCtx) {
          reject(new Error('Could not get final canvas context'));
          return;
        }
        
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height + footerHeight;
        
        finalCtx.drawImage(canvas, 0, 0);
        finalCtx.drawImage(footerCanvas, 0, canvas.height);
        
        resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Design 2: Corner Watermark with Logo and Text
export const createCornerWatermark = async (
  imageUrl: string,
  options: WatermarkDesignOptions
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
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add corner watermark (top-right)
      const cornerSize = 200;
      const cornerX = canvas.width - cornerSize - 20;
      const cornerY = 20;
      
      // Semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(cornerX, cornerY, cornerSize, cornerSize);
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cornerX, cornerY, cornerSize, cornerSize);
      
      // Logo in corner
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoSize = 80;
        const logoX = cornerX + (cornerSize - logoSize) / 2;
        const logoY = cornerY + 20;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        
        // Text in corner
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText('SOURCEABLE', cornerX + cornerSize / 2, logoY + logoSize + 25);
        
        ctx.font = '12px Arial';
        ctx.fillText(options.timestamp, cornerX + cornerSize / 2, logoY + logoSize + 45);
        ctx.fillText(options.location, cornerX + cornerSize / 2, logoY + logoSize + 60);
        
        // Add footer
        const footerHeight = 80;
        const footerCanvas = document.createElement('canvas');
        const footerCtx = footerCanvas.getContext('2d');
        
        if (!footerCtx) {
          reject(new Error('Could not get footer canvas context'));
          return;
        }
        
        footerCanvas.width = canvas.width;
        footerCanvas.height = footerHeight;
        
        footerCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        footerCtx.fillRect(0, 0, footerCanvas.width, footerHeight);
        
        const footerLogo = new Image();
        footerLogo.crossOrigin = 'anonymous';
        footerLogo.onload = () => {
          const logoHeight = 60;
          const logoWidth = logoHeight * 2;
          const logoX = 20;
          const logoY = (footerHeight - logoHeight) / 2;
          footerCtx.drawImage(footerLogo, logoX, logoY, logoWidth, logoHeight);
          
          const lines = [
            options.verificationUrl,
            options.timestamp,
            options.location
          ];
          
          const fontSize = 14;
          const lineHeight = fontSize * 1.4;
          footerCtx.font = `${fontSize}px Arial`;
          footerCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const textX = logoX + logoWidth + 20;
          let textY = 30;
          
          lines.forEach(line => {
            footerCtx.fillText(line, textX, textY);
            textY += lineHeight;
          });
          
          // Combine main image with footer
          const finalCanvas = document.createElement('canvas');
          const finalCtx = finalCanvas.getContext('2d');
          
          if (!finalCtx) {
            reject(new Error('Could not get final canvas context'));
            return;
          }
          
          finalCanvas.width = canvas.width;
          finalCanvas.height = canvas.height + footerHeight;
          
          finalCtx.drawImage(canvas, 0, 0);
          finalCtx.drawImage(footerCanvas, 0, canvas.height);
          
          resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
        };
        
        footerLogo.onerror = () => reject(new Error('Failed to load footer logo'));
        footerLogo.src = options.logoUrl;
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Design 3: Full Overlay Watermark
export const createFullOverlayWatermark = async (
  imageUrl: string,
  options: WatermarkDesignOptions
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
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Create repeating watermark pattern
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoSize = 120;
        const spacing = 200;
        
        // Create repeating pattern
        for (let x = 0; x < canvas.width; x += spacing) {
          for (let y = 0; y < canvas.height; y += spacing) {
            ctx.save();
            ctx.globalAlpha = 0.15; // Very transparent
            ctx.drawImage(logo, x, y, logoSize, logoSize);
            ctx.restore();
          }
        }
        
        // Add footer
        const footerHeight = 80;
        const footerCanvas = document.createElement('canvas');
        const footerCtx = footerCanvas.getContext('2d');
        
        if (!footerCtx) {
          reject(new Error('Could not get footer canvas context'));
          return;
        }
        
        footerCanvas.width = canvas.width;
        footerCanvas.height = footerHeight;
        
        footerCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        footerCtx.fillRect(0, 0, footerCanvas.width, footerHeight);
        
        const footerLogo = new Image();
        footerLogo.crossOrigin = 'anonymous';
        footerLogo.onload = () => {
          const logoHeight = 60;
          const logoWidth = logoHeight * 2;
          const logoX = 20;
          const logoY = (footerHeight - logoHeight) / 2;
          footerCtx.drawImage(footerLogo, logoX, logoY, logoWidth, logoHeight);
          
          const lines = [
            options.verificationUrl,
            options.timestamp,
            options.location
          ];
          
          const fontSize = 14;
          const lineHeight = fontSize * 1.4;
          footerCtx.font = `${fontSize}px Arial`;
          footerCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const textX = logoX + logoWidth + 20;
          let textY = 30;
          
          lines.forEach(line => {
            footerCtx.fillText(line, textX, textY);
            textY += lineHeight;
          });
          
          // Combine main image with footer
          const finalCanvas = document.createElement('canvas');
          const finalCtx = finalCanvas.getContext('2d');
          
          if (!finalCtx) {
            reject(new Error('Could not get final canvas context'));
            return;
          }
          
          finalCanvas.width = canvas.width;
          finalCanvas.height = canvas.height + footerHeight;
          
          finalCtx.drawImage(canvas, 0, 0);
          finalCtx.drawImage(footerCanvas, 0, canvas.height);
          
          resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
        };
        
        footerLogo.onerror = () => reject(new Error('Failed to load footer logo'));
        footerLogo.src = options.logoUrl;
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Design 4: Minimalist Border Watermark
export const createMinimalistBorderWatermark = async (
  imageUrl: string,
  options: WatermarkDesignOptions
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
      
      const borderWidth = 40;
      canvas.width = img.width + borderWidth * 2;
      canvas.height = img.height + borderWidth * 2;
      
      // Fill background with dark color
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image in center
      ctx.drawImage(img, borderWidth, borderWidth);
      
      // Add logo to top border
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoHeight = 30;
        const logoWidth = logoHeight * 2;
        const logoX = borderWidth + 20;
        const logoY = 5;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        // Add text to borders
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('SOURCEABLE', logoX + logoWidth + 20, logoY + 20);
        
        // Bottom border text
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(options.verificationUrl, borderWidth + 20, canvas.height - 15);
        ctx.fillText(options.timestamp, borderWidth + 20, canvas.height - 5);
        
        // Right border text
        ctx.save();
        ctx.translate(canvas.width - 10, borderWidth + 20);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(options.location, 0, 0);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Design 5: Modern Gradient Watermark
export const createModernGradientWatermark = async (
  imageUrl: string,
  options: WatermarkDesignOptions
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
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Create gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add large diagonal watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4); // -45 degrees
      
      // Large transparent text
      ctx.font = 'bold 72px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.textAlign = 'center';
      ctx.fillText('SOURCEABLE', 0, 0);
      
      ctx.restore();
      
      // Add modern footer with gradient
      const footerHeight = 100;
      const footerCanvas = document.createElement('canvas');
      const footerCtx = footerCanvas.getContext('2d');
      
      if (!footerCtx) {
        reject(new Error('Could not get footer canvas context'));
        return;
      }
      
      footerCanvas.width = canvas.width;
      footerCanvas.height = footerHeight;
      
      // Create gradient background for footer
      const footerGradient = footerCtx.createLinearGradient(0, 0, footerCanvas.width, 0);
      footerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      footerGradient.addColorStop(0.5, 'rgba(50, 50, 50, 0.95)');
      footerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      
      footerCtx.fillStyle = footerGradient;
      footerCtx.fillRect(0, 0, footerCanvas.width, footerHeight);
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoHeight = 70;
        const logoWidth = logoHeight * 2;
        const logoX = 30;
        const logoY = (footerHeight - logoHeight) / 2;
        footerCtx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        // Modern text layout
        footerCtx.font = 'bold 18px Arial';
        footerCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        footerCtx.fillText('SOURCEABLE', logoX + logoWidth + 30, logoY + 25);
        
        footerCtx.font = '14px Arial';
        footerCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        footerCtx.fillText(options.verificationUrl, logoX + logoWidth + 30, logoY + 45);
        footerCtx.fillText(options.timestamp, logoX + logoWidth + 30, logoY + 60);
        footerCtx.fillText(options.location, logoX + logoWidth + 30, logoY + 75);
        
        // Combine main image with footer
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        
        if (!finalCtx) {
          reject(new Error('Could not get final canvas context'));
          return;
        }
        
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height + footerHeight;
        
        finalCtx.drawImage(canvas, 0, 0);
        finalCtx.drawImage(footerCanvas, 0, canvas.height);
        
        resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logoUrl;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}; 