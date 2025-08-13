import { Types } from "connectkit";
import { zorbImageDataURI } from "@zoralabs/zorb";

const ZoryAvatar = ({
  address,
  ensImage,
  ensName,
  size,
  radius,
}: Types.CustomAvatarProps) => {
  // Use ENS image if available, otherwise use zorb
  const imageSrc =
    ensImage || (address ? zorbImageDataURI(address) : undefined);

  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: radius,
        height: size,
        width: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={ensName ?? address}
          width="100%"
          height="100%"
          style={{
            objectFit: "cover",
            borderRadius: radius,
          }}
        />
      )}
    </div>
  );
};

export default ZoryAvatar;
