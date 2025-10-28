import { useCallback } from 'react';

export const useSVGCoordinates = (naturalWidth, naturalHeight) => {
  const getRelativeCoords = useCallback((e) => {
    const svg = e.currentTarget;
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX);
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY);

    try {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
      }
    } catch (err) {
      console.warn("SVG point mapping failed, using fallback");
    }

    // Fallback
    const rect = svg.getBoundingClientRect();
    const scaleX = naturalWidth / rect.width;
    const scaleY = naturalHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, [naturalWidth, naturalHeight]);

  return { getRelativeCoords };
};