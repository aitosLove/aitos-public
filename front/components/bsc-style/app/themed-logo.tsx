
import Image from "next/image";

export default function ThemedLogo({ size = "regular" }) {

  
  // Set dimensions based on size prop
  const dimensions = size === "small" ? 36 : 80;
  

  
  return (
    <Image
      src=  "/bsc-ai.svg"

      alt="BSCAI"
      width={dimensions}
      height={dimensions}
      className="rounded-none"
      priority // Add priority to improve loading performance for logo
    />
  );
}