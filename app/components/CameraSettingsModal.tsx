"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { CameraSettings } from "@/lib/hooks/useCameraSettings";

interface CameraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraSettings: CameraSettings;
  onUpdateSettings: (updates: Partial<CameraSettings>) => void;
  isMobile: boolean;
}

// Reusable button component
interface SettingButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SettingButton({ isActive, onClick, children }: SettingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

// Helper function to create setting buttons
function createSettingButtons<T extends keyof CameraSettings>(
  setting: T,
  currentValue: CameraSettings[T],
  options: Array<{ value: CameraSettings[T]; label: string }>,
  onUpdate: (updates: Partial<CameraSettings>) => void,
) {
  return options.map(({ value, label }) => (
    <SettingButton
      key={label}
      isActive={currentValue === value}
      onClick={() => onUpdate({ [setting]: value } as Partial<CameraSettings>)}
    >
      {label}
    </SettingButton>
  ));
}

export default function CameraSettingsModal({
  isOpen,
  onClose,
  cameraSettings,
  onUpdateSettings,
  isMobile,
}: CameraSettingsModalProps) {
  if (!isOpen || !isMobile) return null;

  // Define options for each setting
  const mainCameraOptions = [
    { value: "user" as const, label: "User-facing" },
    { value: "environment" as const, label: "Environment" },
  ];

  const insetPositionOptions = [
    { value: "top-left" as const, label: "Top Left" },
    { value: "top-right" as const, label: "Top Right" },
    { value: "bottom-left" as const, label: "Bottom Left" },
    { value: "bottom-right" as const, label: "Bottom Right" },
  ];

  const insetShapeOptions = [
    { value: "round" as const, label: "Round" },
    { value: "rounded" as const, label: "Rounded" },
    { value: "square" as const, label: "Square" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Camera Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Main Camera Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Camera
            </label>
            <div className="flex gap-2">
              {createSettingButtons(
                "mainCamera",
                cameraSettings.mainCamera,
                mainCameraOptions,
                onUpdateSettings,
              )}
            </div>
          </div>

          {/* Inset Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Inset
            </label>
            <SettingButton
              isActive={cameraSettings.showInset}
              onClick={() =>
                onUpdateSettings({ showInset: !cameraSettings.showInset })
              }
            >
              {cameraSettings.showInset ? "Enabled" : "Disabled"}
            </SettingButton>
          </div>

          {/* Inset Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inset Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {createSettingButtons(
                "insetPosition",
                cameraSettings.insetPosition,
                insetPositionOptions,
                onUpdateSettings,
              )}
            </div>
          </div>

          {/* Inset Shape */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inset Shape
            </label>
            <div className="flex gap-2">
              {createSettingButtons(
                "insetShape",
                cameraSettings.insetShape,
                insetShapeOptions,
                onUpdateSettings,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
