import { motion } from "framer-motion";
import { BlocksIcon,Wallet,Bot } from "lucide-react";
import { useTheme } from "next-themes";


const VALUE_PROPS = [
    {
      icon: BlocksIcon,
      title: "No Code Automation",
      description: "Create complex workflows through simple blueprint selection",
    },
    {
      icon: Wallet,
      title: "Smart Risk Management",
      description: "AI-powered portfolio optimization with dynamic risk controls",
    },
    {
      icon: Bot,
      title: "Proactive Agents",
      description: "24/7 automated monitoring and execution",
    },
  ];


const FeatureCards = () => {
  const { theme } = useTheme();
  
  // Define color sets for light and dark modes
  const lightColors = ["#34d399", "#93c5fd", "#d8b4fe"];
  const darkColors = ["#10b981", "#1E67C6", "#c084fc"];
//   lightColors
  // Select colors based on current theme
  const colors = theme === "dark" ? darkColors : lightColors;
  return (
    <motion.div
      className="space-y-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-start lg:text-center px-2">
        Why Choose Suikai?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {VALUE_PROPS.map((value, index) => {
          // Get color for this card (cycling through the array)
          const bgColor = colors[index % colors.length];
          
          return (
            <motion.div
              key={index}
              className="p-4 lg:p-6 relative overflow-hidden group bg-gradient-to-b from-background to-muted/20 border-none shadow-xl rounded-2xl"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              {/* Gradient background that slides in on hover */}
              <div 
                className="absolute inset-0 rounded-2xl translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-in-out"
                style={{ 
                  background: bgColor,
                  // Add a subtle gradient if you want
                  backgroundImage: `linear-gradient(to right, ${bgColor}, ${adjustColor(bgColor, -20)})`
                }}
              />
              
              {/* Content container */}
              <div className="relative z-10">
                <div className="md:h-12 md:w-12 h-10 w-10 mb-2 md:mb-4 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <value.icon strokeWidth={1.2} className="h-5 w-5 md:h-7 md:w-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2 group-hover:text-white transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-sm group-hover:text-white/80 transition-colors duration-300">
                  {value.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
// Helper function to adjust color brightness
function adjustColor(color: string, amount: number) {
  return color.replace(/\w\w/g, m => {
    const val = Math.min(255, Math.max(0, parseInt(m, 16) + amount));
    return (val < 16 ? '0' : '') + val.toString(16);
  });
}
export default FeatureCards;
