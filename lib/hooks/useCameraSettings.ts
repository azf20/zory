import { useState, useCallback, useEffect } from "react";

export interface CameraSettings {
  showInset: boolean;
  mainCamera: "user" | "environment";
  insetPosition: "bottom-right" | "top-right" | "bottom-left" | "top-left";
  insetShape: "round" | "rounded" | "square";
}

export interface UseCameraSettingsReturn {
  cameraSettings: CameraSettings;
  mainCamera: "user" | "environment";
  getInsetPositionClasses: (
    position: CameraSettings["insetPosition"],
  ) => string;
  getInsetShapeClasses: (shape: CameraSettings["insetShape"]) => string;
  updateCameraSettings: (updates: Partial<CameraSettings>) => void;
  isLoading: boolean;
}

export function useCameraSettings(isMobile: boolean): UseCameraSettingsReturn {
  // Camera settings with defaults based on device type
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(() => {
    // Try to restore settings from session storage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("cameraSettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the stored settings have all required properties
          if (
            parsed.showInset !== undefined &&
            parsed.mainCamera &&
            parsed.insetPosition &&
            parsed.insetShape
          ) {
            return parsed;
          }
        }
      } catch (error) {
        console.warn(
          "Failed to restore camera settings from session storage:",
          error,
        );
      }
    }

    // Return defaults if no valid stored settings
    return {
      showInset: true,
      mainCamera: "environment",
      insetPosition: "bottom-right",
      insetShape: "round",
    };
  });

  const [isLoading, setIsLoading] = useState(true);

  // Derived main camera setting based on device type
  const mainCamera = isMobile ? cameraSettings.mainCamera : "user";

  // Helper function to get inset positioning classes
  const getInsetPositionClasses = useCallback(
    (position: CameraSettings["insetPosition"]) => {
      switch (position) {
        case "top-left":
          return "top-4 left-4";
        case "top-right":
          return "top-4 right-4";
        case "bottom-left":
          return "bottom-4 left-4";
        case "bottom-right":
        default:
          return "bottom-4 right-4";
      }
    },
    [],
  );

  // Helper function to get inset shape classes
  const getInsetShapeClasses = useCallback(
    (shape: CameraSettings["insetShape"]) => {
      switch (shape) {
        case "square":
          return "";
        case "rounded":
          return "rounded-lg";
        case "round":
        default:
          return "rounded-full";
      }
    },
    [],
  );

  // Save settings to session storage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "cameraSettings",
          JSON.stringify(cameraSettings),
        );
      } catch (error) {
        console.warn(
          "Failed to save camera settings to session storage:",
          error,
        );
      }
    }
  }, [cameraSettings]);

  // Update camera settings
  const updateCameraSettings = useCallback(
    (updates: Partial<CameraSettings>) => {
      setCameraSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Set loading to false after initial render
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    cameraSettings,
    mainCamera,
    getInsetPositionClasses,
    getInsetShapeClasses,
    updateCameraSettings,
    isLoading,
  };
}
