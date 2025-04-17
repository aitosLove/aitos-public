
import Image from "next/image";

export default function ThemedLogo({ size = "regular" }) {

  
  // Set dimensions based on size prop
  const dimensions = size === "small" ? 36 : 56;
  

  
  return (
    <Image
      src=  "/Asol_p.svg"
      alt="ASOL"
      width={dimensions}
      height={dimensions}
      className="rounded-none"
      priority 
    />
  );
}