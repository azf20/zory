import { useState, useEffect, useCallback, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: "user" | "environment";
}

interface UseCamerasReturn {
  // Stream refs for direct access (use .current to get the stream)
  frontStreamRef: React.RefObject<MediaStream | null>;
  backStreamRef: React.RefObject<MediaStream | null>;

  // Device info
  devices: CameraDevice[];
  numberOfCameras: number;

  // Environment
  isMobile: boolean;

  // States
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;

  // Actions
  refreshDevices: () => Promise<void>;
}

export function useCameras(): UseCamerasReturn {
  // Use refs for streams (no re-renders when streams change)
  const frontStreamRef = useRef<MediaStream | null>(null);
  const backStreamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mounted = useRef(false);

  // Cleanup streams on unmount
  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  // Cleanup streams when they change
  useEffect(() => {
    return () => {
      if (frontStreamRef.current) {
        frontStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
      if (backStreamRef.current) {
        backStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  // Enumerate available camera devices
  const enumerateDevices = useCallback(async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          facingMode: undefined, // Will be determined when we get the stream
        }));

      return videoDevices;
    } catch (err) {
      console.warn("Failed to enumerate devices:", err);
      return [];
    }
  }, []);

  // Start a camera stream - ultra simple
  const startCameraStream = useCallback(
    async (facingMode: "user" | "environment"): Promise<MediaStream | null> => {
      try {
        // Request high resolution with facing mode constraint
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });

        return stream;
      } catch (err) {
        // Let the caller handle the error
        throw err;
      }
    },
    [],
  );

  // Initialize camera streams
  const initializeCameras = useCallback(async () => {
    if (!mounted.current) return;

    setLoadingCameras(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // Initialize mobile detection (will be set to true if Farcaster mobile)
      let isMobileDevice = false;

      // Check if we're in a Farcaster Mini App context
      try {
        const context = await sdk.context;

        // We're in a Farcaster context
        if (context.features?.cameraAndMicrophoneAccess === true) {
          // Permissions already granted - proceed with camera access
          // Set mobile if not web platform
          if (
            context.client?.platformType &&
            context.client.platformType !== "web"
          ) {
            isMobileDevice = true;
          }
        } else {
          // Permissions not granted - check platform
          if (
            context.client?.platformType === "web" &&
            process.env.NEXT_PUBLIC_ENVIRONMENT !== "local"
          ) {
            // Desktop Farcaster Mini App - camera not supported
            setError(
              "Camera access not supported in desktop Farcaster Mini Apps. Please visit https://zory.me",
            );
            setLoadingCameras(false);
            return;
          } else {
            // Mobile Farcaster Mini App - request permissions
            try {
              await sdk.actions.requestCameraAndMicrophoneAccess();
              isMobileDevice = true;
            } catch {
              setPermissionDenied(true);
              setError("Camera permission denied");
              setLoadingCameras(false);
              return;
            }
          }
        }
      } catch {
        // Not in Farcaster context - this is fine, proceed with normal camera access
      }

      // Enumerate devices
      const videoDevices = await enumerateDevices();
      setDevices(videoDevices);
      setNumberOfCameras(videoDevices.length);

      // If still false, fall back to user agent detection
      if (!isMobileDevice) {
        isMobileDevice =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          );
      }

      setIsMobile(isMobileDevice);

      if (videoDevices.length === 0) {
        // If no devices found, try a basic camera request as fallback
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (basicStream && mounted.current) {
            frontStreamRef.current = basicStream;
            setLoadingCameras(false);
            return;
          }
        } catch {
          // Basic camera access failed
        }

        setError("No camera devices found");
        setLoadingCameras(false);
        return;
      }

      // On mobile, try to get both cameras
      if (isMobileDevice) {
        // Start back camera with facingMode: "environment"
        try {
          const backStream = await startCameraStream("environment");
          if (backStream && mounted.current) {
            backStreamRef.current = backStream;
          }
        } catch {
          // Back camera failed to initialize
        }

        // Start front camera with facingMode: "user"
        try {
          const frontStream = await startCameraStream("user");
          if (frontStream && mounted.current) {
            frontStreamRef.current = frontStream;
          }
        } catch {
          // Front camera failed to initialize
        }
      } else {
        // On desktop, just get any camera
        const frontStream = await startCameraStream("user");
        if (frontStream && mounted.current) {
          frontStreamRef.current = frontStream;
        }
      }

      // Only update device info for devices we actually use
      if (mounted.current) {
        setDevices(videoDevices);
      }
    } catch (err: unknown) {
      if (mounted.current) {
        if (err instanceof Error) {
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            setPermissionDenied(true);
            setError("Camera permission denied");
          } else if (err.name === "OverconstrainedError") {
            setError("Camera constraints too strict - try refreshing");
          } else if (err.message?.includes("Permissions policy violation")) {
            setError("Camera access blocked by iframe restrictions");
          } else {
            setError(err.message || "Failed to initialize cameras");
          }
        } else {
          setError("Failed to initialize cameras");
        }
      }
    } finally {
      if (mounted.current) {
        setLoadingCameras(false);
      }
    }
  }, [enumerateDevices, startCameraStream]);

  // Refresh devices (useful for when cameras are connected/disconnected)
  const refreshDevices = useCallback(async () => {
    await initializeCameras();
  }, [initializeCameras]);

  // Initialize on mount
  useEffect(() => {
    initializeCameras();
  }, [initializeCameras]);

  return {
    frontStreamRef,
    backStreamRef,
    devices,
    numberOfCameras,
    isMobile,
    isLoading: loadingCameras,
    error,
    permissionDenied,
    refreshDevices,
  };
}
