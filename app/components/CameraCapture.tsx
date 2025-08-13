"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import {
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";
import { useCameras } from "@/lib/hooks/useCameras";
import { useCameraSettings } from "@/lib/hooks/useCameraSettings";
import CameraSettingsModal from "./CameraSettingsModal";
import FileUploadCapture from "./FileUploadCapture";

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  restart?: boolean;
}

export default function CameraCapture({
  onPhotoCapture,
  restart,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frontCameraRef = useRef<HTMLVideoElement>(null);

  // Use the camera hook
  const {
    frontStreamRef,
    backStreamRef,
    isMobile,
    isLoading,
    error: cameraError,
    permissionDenied,
    refreshDevices,
  } = useCameras();

  // Camera settings hook
  const {
    cameraSettings,
    mainCamera,
    getInsetPositionClasses,
    getInsetShapeClasses,
    updateCameraSettings,
    isLoading: settingsLoading,
  } = useCameraSettings(isMobile);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Upload mode state
  const [showUploadMode, setShowUploadMode] = useState(false);

  // Function to switch back to camera mode and restart streams
  const switchToCamera = useCallback(async () => {
    setShowUploadMode(false);
    // Refresh camera streams when switching back
    try {
      await refreshDevices();
    } catch (error) {
      console.error("Failed to refresh camera devices:", error);
    }
  }, [refreshDevices]);

  // Consolidated stream management effect
  useEffect(() => {
    // Skip if streams aren't ready yet
    if (!frontStreamRef.current && !backStreamRef.current) {
      return;
    }

    // Main video stream assignment
    if (videoRef.current) {
      const currentSrcObject = videoRef.current.srcObject;

      if (isMobile && backStreamRef.current && frontStreamRef.current) {
        // Mobile: assign based on mainCamera setting
        const targetStream =
          mainCamera === "user"
            ? frontStreamRef.current
            : backStreamRef.current;
        if (currentSrcObject !== targetStream) {
          if (mainCamera === "user") {
            console.log(
              "📹 Setting front stream to main video (mobile user mode)",
            );
          } else {
            console.log(
              "📹 Setting back stream to main video (mobile environment mode)",
            );
          }
          videoRef.current.srcObject = targetStream;
        }
      } else if (
        backStreamRef.current &&
        currentSrcObject !== backStreamRef.current
      ) {
        // Desktop or mobile with only back stream: use back stream
        console.log("📹 Setting back stream to main video");
        videoRef.current.srcObject = backStreamRef.current;
      } else if (
        frontStreamRef.current &&
        !isMobile &&
        currentSrcObject !== frontStreamRef.current
      ) {
        // Desktop with only front stream: use front stream
        console.log("📹 Setting front stream to main video (desktop mode)");
        videoRef.current.srcObject = frontStreamRef.current;
      }
    }

    // Inset video stream assignment (mobile only)
    if (frontCameraRef.current && isMobile && cameraSettings.showInset) {
      const currentInsetSrcObject = frontCameraRef.current.srcObject;
      let targetInsetStream: MediaStream | null = null;

      if (mainCamera === "user" && backStreamRef.current) {
        // Main camera shows user camera, so inset shows environment camera
        targetInsetStream = backStreamRef.current;
        if (currentInsetSrcObject !== targetInsetStream) {
          console.log(
            "📹 Setting back stream to inset video (main shows user)",
          );
          frontCameraRef.current.srcObject = targetInsetStream;
        }
      } else if (mainCamera === "environment" && backStreamRef.current) {
        // Main camera shows environment camera, so inset shows user camera
        targetInsetStream = frontStreamRef.current;
        if (currentInsetSrcObject !== targetInsetStream) {
          console.log(
            "📹 Setting front stream to inset video (main shows environment)",
          );
          frontCameraRef.current.srcObject = targetInsetStream;
        }
      } else if (
        frontStreamRef.current &&
        currentInsetSrcObject !== frontStreamRef.current
      ) {
        // Only have front stream, so inset shows front camera
        console.log(
          "📹 Setting front stream to inset video (only front available)",
        );
        frontCameraRef.current.srcObject = frontStreamRef.current;
      }
    }
  }, [
    frontStreamRef.current,
    backStreamRef.current,
    isMobile,
    mainCamera,
    cameraSettings.showInset,
  ]);

  // Handle restart
  useEffect(() => {
    if (restart) {
      // Reset any problematic states if needed
    }
  }, [restart]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");

      // Create a high-resolution square canvas
      // Use the original video resolution but ensure minimum high quality
      const videoSize = Math.min(video.videoWidth, video.videoHeight);
      const size = Math.max(videoSize, 1080); // Ensure at least 1080px output
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Calculate offset to center the image from video
        const xOffset = (video.videoWidth - videoSize) / 2;
        const yOffset = (video.videoHeight - videoSize) / 2;

        // Draw the center square portion of the video with conditional mirroring
        if (mainCamera === "user") {
          // Mirror the main video when showing user-facing camera (selfie mode)
          ctx.save();
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            video,
            xOffset,
            yOffset,
            videoSize,
            videoSize,
            0,
            0,
            size,
            size,
          );
          ctx.restore();
        } else {
          // No mirroring for environment camera
          ctx.drawImage(
            video,
            xOffset,
            yOffset,
            videoSize,
            videoSize,
            0,
            0,
            size,
            size,
          );
        }

        // Add selfie inset on mobile if we have a front camera and inset is visible
        if (
          isMobile &&
          frontCameraRef.current &&
          frontStreamRef.current &&
          cameraSettings.showInset
        ) {
          // Determine which camera to use for inset based on main camera setting
          const insetVideo =
            mainCamera === "user"
              ? backStreamRef.current
                ? frontCameraRef.current
                : videoRef.current
              : frontCameraRef.current;
          const mainVideo = videoRef.current;

          if (!insetVideo || !mainVideo) return;

          // Calculate inset size and position based on settings
          const insetSize = size * 0.3; // 30% of the main image
          const margin = size * 0.03; // 3% margin

          // Calculate inset position based on cameraSettings.insetPosition
          let insetX: number, insetY: number;
          switch (cameraSettings.insetPosition) {
            case "top-left":
              insetX = margin;
              insetY = margin;
              break;
            case "top-right":
              insetX = size - insetSize - margin;
              insetY = margin;
              break;
            case "bottom-left":
              insetX = margin;
              insetY = size - insetSize - margin;
              break;
            case "bottom-right":
            default:
              insetX = size - insetSize - margin;
              insetY = size - insetSize - margin;
              break;
          }

          // Calculate inset camera center crop
          const insetVideoSize = Math.min(
            insetVideo.videoWidth,
            insetVideo.videoHeight,
          );
          const insetVideoXOffset =
            (insetVideo.videoWidth - insetVideoSize) / 2;
          const insetVideoYOffset =
            (insetVideo.videoHeight - insetVideoSize) / 2;

          // Create clip path for inset based on shape setting
          ctx.save();
          ctx.beginPath();

          let circleX = insetX + insetSize / 2;
          let circleY = insetY + insetSize / 2;
          let radius = insetSize / 2;
          let cornerRadius = insetSize * 0.1;

          switch (cameraSettings.insetShape) {
            case "round":
              // Circular clip path
              circleX = insetX + insetSize / 2;
              circleY = insetY + insetSize / 2;
              radius = insetSize / 2;
              ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
              break;
            case "rounded":
              // Rounded rectangle clip path
              cornerRadius = insetSize * 0.1; // 10% of inset size
              ctx.roundRect(insetX, insetY, insetSize, insetSize, cornerRadius);
              break;
            case "square":
            default:
              // Square clip path (no rounding)
              ctx.rect(insetX, insetY, insetSize, insetSize);
              break;
          }

          ctx.closePath();
          ctx.clip();

          // Draw the inset with conditional mirroring based on camera type
          if (mainCamera === "environment" && backStreamRef.current) {
            // Inset shows user-facing camera (front camera) - mirror for selfie effect
            ctx.save();
            ctx.translate(insetX + insetSize, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
              insetVideo,
              insetVideoXOffset,
              insetVideoYOffset,
              insetVideoSize,
              insetVideoSize,
              0,
              insetY,
              insetSize,
              insetSize,
            );
            ctx.restore();
          } else {
            // Inset shows environment camera (back camera) - no mirroring
            ctx.drawImage(
              insetVideo,
              insetVideoXOffset,
              insetVideoYOffset,
              insetVideoSize,
              insetSize,
              insetX,
              insetY,
              insetSize,
              insetSize,
            );
          }

          // Add white border around inset based on shape
          ctx.beginPath();

          switch (cameraSettings.insetShape) {
            case "round":
              ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
              break;
            case "rounded":
              const cornerRadius = insetSize * 0.1;
              ctx.roundRect(insetX, insetY, insetSize, insetSize, cornerRadius);
              break;
            case "square":
            default:
              ctx.rect(insetX, insetY, insetSize, insetSize);
              break;
          }

          ctx.strokeStyle = "white";
          ctx.lineWidth = size * 0.01;
          ctx.stroke();

          ctx.restore();
        }

        const photoUrl = canvas.toDataURL("image/jpeg", 1.0);
        onPhotoCapture(photoUrl);
      }
    }
  }, [
    frontStreamRef.current,
    isMobile,
    onPhotoCapture,
    cameraSettings.showInset,
    cameraSettings.insetPosition,
    cameraSettings.insetShape,
    mainCamera,
  ]);

  // Check if camera is ready
  const isCameraReady = Boolean(
    !isLoading &&
      !settingsLoading &&
      !cameraError &&
      (backStreamRef.current || (frontStreamRef.current && !isMobile)),
  );

  // Check if we should show file upload fallback (desktop Farcaster with camera access error OR permission denied)
  const shouldShowFileUpload = Boolean(
    !isLoading &&
      !settingsLoading &&
      cameraError &&
      (cameraError.includes(
        "Camera access not supported in desktop Farcaster Mini Apps",
      ) ||
        permissionDenied),
  );

  // Show file upload fallback for desktop Farcaster, permission denied, OR when user manually switches to upload mode
  if (shouldShowFileUpload || showUploadMode) {
    return (
      <FileUploadCapture
        onPhotoCapture={onPhotoCapture}
        restart={restart}
        onSwitchToCamera={switchToCamera}
        showCameraSwitch={!shouldShowFileUpload} // Only show switch if not forced by camera unavailability
        isMobile={isMobile}
      />
    );
  }

  return (
    <div className="relative w-full max-w-[480px] aspect-square bg-black rounded-lg overflow-hidden mx-auto">
      {/* Main camera video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${
          mainCamera === "user" ? "scale-x-[-1]" : ""
        }`}
        onError={(e) => {
          console.error("❌ Main video error:", e);
        }}
      />

      {/* Camera controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {/* Upload button (always visible) */}
        <button
          onClick={() => setShowUploadMode(true)}
          className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-20"
          title="Upload image instead"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
        </button>

        {/* Flip button (mobile only) */}
        {isMobile && (
          <button
            onClick={() =>
              updateCameraSettings({
                mainCamera: mainCamera === "user" ? "environment" : "user",
              })
            }
            className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-20"
            title={`Switch to ${mainCamera === "user" ? "environment" : "user"} camera`}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}

        {/* Settings button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-20"
            title="Camera settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera Settings Modal */}
      <CameraSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        cameraSettings={cameraSettings}
        onUpdateSettings={updateCameraSettings}
        isMobile={isMobile}
      />

      {/* Front camera inset (mobile only) */}
      {isMobile &&
        isCameraReady &&
        frontStreamRef.current &&
        cameraSettings.showInset && (
          <video
            ref={frontCameraRef}
            autoPlay
            playsInline
            muted
            className={`absolute w-24 h-24 object-cover border-2 border-white z-50 ${getInsetPositionClasses(cameraSettings.insetPosition)} ${getInsetShapeClasses(cameraSettings.insetShape)} ${
              // Mirror inset when it's showing the user-facing camera (for natural selfie experience)
              mainCamera === "environment" && backStreamRef.current
                ? "scale-x-[-1]"
                : ""
            }`}
            onError={(e) => {
              console.error("❌ Front camera inset error:", e);
            }}
          />
        )}

      {/* Remove inset button (mobile only) */}
      {isMobile &&
        isCameraReady &&
        frontStreamRef.current &&
        cameraSettings.showInset && (
          <button
            onClick={() =>
              updateCameraSettings({ showInset: !cameraSettings.showInset })
            }
            className="absolute bg-red-500 hover:bg-red-600 rounded-full p-1 text-white transition-colors z-[60]"
            style={{
              // Position the X button relative to the inset position
              ...(cameraSettings.insetPosition === "top-left" && {
                top: "0.5rem",
                left: "0.5rem",
              }),
              ...(cameraSettings.insetPosition === "top-right" && {
                top: "0.5rem",
                right: "0.5rem",
              }),
              ...(cameraSettings.insetPosition === "bottom-left" && {
                bottom: "0.5rem",
                left: "0.5rem",
              }),
              ...(cameraSettings.insetPosition === "bottom-right" && {
                bottom: "0.5rem",
                right: "0.5rem",
              }),
            }}
            title="Remove inset"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

      {/* Add inset button (when inset is hidden) */}
      {isMobile &&
        isCameraReady &&
        frontStreamRef.current &&
        !cameraSettings.showInset && (
          <button
            onClick={() =>
              updateCameraSettings({ showInset: !cameraSettings.showInset })
            }
            className={`absolute bg-green-500 hover:bg-green-600 rounded-full p-2 text-white transition-colors z-20 ${getInsetPositionClasses(cameraSettings.insetPosition)}`}
            title="Add inset"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}

      {/* Loading/Error state */}
      {!isCameraReady ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
          {cameraError ? (
            <div className="text-center p-4 text-red-500 max-w-sm">
              <p>{cameraError}</p>
              {permissionDenied && (
                <p className="mt-2 text-sm">
                  Please refresh and grant camera permission
                </p>
              )}
            </div>
          ) : (
            <div className="text-center p-4 max-w-sm">
              <p className="mb-2">Loading camera...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Capture button */}
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full border-4 border-black" />
          </button>
        </>
      )}
    </div>
  );
}