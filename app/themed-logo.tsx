import Image from "next/image";

// Server component that handles SSR
export default function ThemedLogo({ size = "regular" }) {
  // Set dimensions based on size prop
  const dimensions = size === "small" ? 32 : 80;
  
  return (
    <>
      {/* This div will be rendered on the server */}
      <div className="hidden dark:block">
        <Image
          src="/aitos-w.png"
          alt="AITOS"
          width={dimensions}
          height={dimensions}
          className="rounded-none"
          priority 
        />
      </div>
      
      {/* This div will be rendered on the server */}
      <div className="block dark:hidden">
        <Image
          src="/aitos.png"
          alt="AITOS"
          width={dimensions}
          height={dimensions}
          className="rounded-none"
          priority 
        />
      </div>
    </>
  );
}