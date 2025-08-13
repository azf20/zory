"use client";

import React, { useCallback, useRef, useState } from "react";
import { ArrowUpTrayIcon, VideoCameraIcon } from "@heroicons/react/24/solid";

interface FileUploadCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  restart?: boolean;
  onSwitchToCamera?: () => void;
  showCameraSwitch?: boolean;
  isMobile?: boolean;
}

export default function FileUploadCapture({
  onPhotoCapture,
  restart,
  onSwitchToCamera,
  showCameraSwitch = false,
  isMobile = false,
}: FileUploadCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null,
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);

        // Calculate initial scale to fit the image in the square canvas
        const canvasSize = 480; // Match the camera capture size
        const imageAspectRatio = img.width / img.height;

        let initialScale: number;
        let initialX: number;
        let initialY: number;

        if (imageAspectRatio > 1) {
          // Wide image - scale to fit height, center horizontally
          initialScale = canvasSize / img.height;
          initialX = (canvasSize - img.width * initialScale) / 2;
          initialY = 0;
        } else {
          // Tall or square image - scale to fit width, center vertically
          initialScale = canvasSize / img.width;
          initialX = 0;
          initialY = (canvasSize - img.height * initialScale) / 2;
        }

        setImagePosition({ x: initialX, y: initialY, scale: initialScale });
      };

      img.src = URL.createObjectURL(file);
    },
    [],
  );

  // Draw the image on canvas
  const drawImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(
      uploadedImage,
      imagePosition.x,
      imagePosition.y,
      uploadedImage.width * imagePosition.scale,
      uploadedImage.height * imagePosition.scale,
    );
  }, [uploadedImage, imagePosition]);

  // Handle mouse/touch events for dragging
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!uploadedImage) return;

      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: event.clientX - rect.left - imagePosition.x,
          y: event.clientY - rect.top - imagePosition.y,
        });
      }
    },
    [uploadedImage, imagePosition],
  );

  // Helper function to get distance between two touches
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2),
    );
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!uploadedImage) return;

      event.preventDefault();

      if (event.touches.length === 1) {
        // Single touch - start dragging
        setIsDragging(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const touch = event.touches[0];
          setDragStart({
            x: touch.clientX - rect.left - imagePosition.x,
            y: touch.clientY - rect.top - imagePosition.y,
          });
        }
      } else if (event.touches.length === 2) {
        // Two touches - start pinch zoom
        setIsDragging(false);
        setLastTouchDistance(getTouchDistance(event.touches));
      }
    },
    [uploadedImage, imagePosition, getTouchDistance],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !uploadedImage || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = event.clientX - rect.left - dragStart.x;
      const newY = event.clientY - rect.top - dragStart.y;

      setImagePosition((prev) => ({ ...prev, x: newX, y: newY }));
    },
    [isDragging, uploadedImage, dragStart],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!uploadedImage || !canvasRef.current) return;

      event.preventDefault();

      if (event.touches.length === 1 && isDragging) {
        // Single touch - drag the image
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = event.touches[0];
        const newX = touch.clientX - rect.left - dragStart.x;
        const newY = touch.clientY - rect.top - dragStart.y;

        setImagePosition((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (event.touches.length === 2 && lastTouchDistance !== null) {
        // Two touches - pinch to zoom
        const currentDistance = getTouchDistance(event.touches);
        const scaleChange = currentDistance / lastTouchDistance;

        setImagePosition((prev) => ({
          ...prev,
          scale: Math.max(0.1, Math.min(3, prev.scale * scaleChange)),
        }));

        setLastTouchDistance(currentDistance);
      }
    },
    [isDragging, uploadedImage, dragStart, lastTouchDistance, getTouchDistance],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(null);
  }, []);

  // Handle zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!uploadedImage) return;

      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;

      setImagePosition((prev) => ({
        ...prev,
        scale: Math.max(0.1, Math.min(3, prev.scale * scaleFactor)),
      }));
    },
    [uploadedImage],
  );

  // Capture the final image
  const captureImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current) return;

    // Create a high-resolution square canvas for the final output
    const outputCanvas = document.createElement("canvas");
    const size = 1080; // Much higher resolution output
    outputCanvas.width = size;
    outputCanvas.height = size;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Fill with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);

    // Scale the positioning from preview (480px) to output (1080px)
    const scaleFactor = size / 480; // 480 is the preview canvas size

    // Draw the positioned image at higher resolution
    ctx.drawImage(
      uploadedImage,
      imagePosition.x * scaleFactor,
      imagePosition.y * scaleFactor,
      uploadedImage.width * imagePosition.scale * scaleFactor,
      uploadedImage.height * imagePosition.scale * scaleFactor,
    );

    const photoUrl = outputCanvas.toDataURL("image/jpeg", 1.0);
    onPhotoCapture(photoUrl);
  }, [uploadedImage, imagePosition, onPhotoCapture]);

  // Reset to initial state
  const resetUpload = useCallback(() => {
    setUploadedImage(null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Draw image whenever position changes
  React.useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Handle restart prop
  React.useEffect(() => {
    if (restart) {
      resetUpload();
    }
  }, [restart, resetUpload]);

  return (
    <div className="relative w-full max-w-[480px] aspect-square bg-black rounded-lg overflow-hidden mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!uploadedImage ? (
        /* Upload prompt */
        <>
          {/* Back to camera button (if available) */}
          {showCameraSwitch && onSwitchToCamera && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <button
                onClick={onSwitchToCamera}
                className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
                title="Switch to camera"
              >
                <VideoCameraIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-center p-8">
              <ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Upload an Image</h3>
              <p className="text-gray-300 mb-6 max-w-sm">
                {"Upload an image to create your Zory."}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Choose Image
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Canvas for image positioning */}
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="absolute inset-0 w-full h-full cursor-move touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          />

          {/* Controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            {showCameraSwitch && onSwitchToCamera && (
              <button
                onClick={onSwitchToCamera}
                className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-20"
                title="Switch to camera"
              >
                <VideoCameraIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={resetUpload}
              className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-20"
              title="Upload different image"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-black/50 rounded-lg p-3 text-white text-sm max-w-48">
            <p>Drag to reposition</p>
            <p>{isMobile ? "Pinch to zoom" : "Scroll to zoom"}</p>
          </div>

          {/* Capture button */}
          <button
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full border-4 border-black" />
          </button>
        </>
      )}
    </div>
  );
}
