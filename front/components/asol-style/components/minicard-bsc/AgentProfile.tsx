"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Copy,
  Database,
  Zap,
  Activity,
  Globe,
  LineChart,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  RefreshCw,
  PieChart as PieChartIcon,
} from "lucide-react";
import { getNewestHolding, getEventsCount, getTasksCount } from "@/lib/action";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { getTokenColor, getOthersColor } from "@/lib/tokenColors";
import ThemedLogo from "@/app/themed-logo";
import Image from "next/image";

// Enhanced Status Indicator
const AgentStatusIndicator = () => {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30"
      animate={{
        boxShadow: [
          "0 0 0px rgba(124, 58, 237, 0)",
          "0 0 15px rgba(124, 58, 237, 0.3)",
          "0 0 0px rgba(124, 58, 237, 0)",
        ],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      <span className="text-primary text-xs font-medium">Live Syncing</span>
    </motion.div>
  );
};

export default function AgentProfile() {
  const [copied, setCopied] = useState(false);
  const address = "0x634513A5ADF2c5bB6e82b18376f7BAe222ED15C3";
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>("0s ago");
  const [positions, setPositions] = useState<
    Array<{ token: string; value: number; color?: string; percentage?: string }>
  >([]);
  const [valueNotFiltered, setValueNotFiltered] = useState<number>(0);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState<boolean>(false);

  // Memoized function to calculate time ago
  const calculateTimeAgo = useCallback((lastUpdate: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - lastUpdate.getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }, []);

  // Effect to update time ago every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo(lastUpdated));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, calculateTimeAgo]);

  // Enhanced data fetching hook
  const useAgentData = (fetchFn: () => Promise<number>, defaultValue = 0) => {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
      try {
        const data = await fetchFn();
        setValue(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }, [fetchFn]);

    useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 120000);
      return () => clearInterval(interval);
    }, [fetchData]);

    return { value, loading };
  };

  const events = useAgentData(getEventsCount);
  const tasks = useAgentData(getTasksCount);
  const holdings = useAgentData(async () => {
    const data = await getNewestHolding();
    return data?.totalBalanceUsd_notFiltered || 0;
  });

  const refreshPortfolio = async () => {
    setIsPortfolioLoading(true);
    try {
      const data = await getNewestHolding();
      if (data) {
        const portfolioData = data.validPortfolio.map((item) => ({
          token: item.coinSymbol,
          value: item.balanceUsd,
        }));

        // Calculate total value and percentages
        const totalValue = portfolioData.reduce(
          (sum, pos) => sum + pos.value,
          0
        );

        setPositions(
          portfolioData.map((pos) => ({
            ...pos,
            percentage: ((pos.value / totalValue) * 100).toFixed(1),
            color: getTokenColor(pos.token),
          }))
        );

        setValueNotFiltered(data.totalBalanceUsd_notFiltered);
        const now = new Date();
        setLastUpdated(now);
        setTimeAgo(calculateTimeAgo(now));
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  useEffect(() => {
    refreshPortfolio();
    const interval = setInterval(refreshPortfolio, 120000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total value and other value
  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const otherValue = valueNotFiltered - totalValue;

  return (
    <>
      {/* Navigation */}
      <nav className=" backdrop-blur-md bg-background/70 relative top-0 z-40">
        <div className="pt-4 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
              <Globe className="text-primary w-5 h-5" />
            </div> */}
            <span className="text-xl font-semibold tracking-tight">
              Agent Dashboard{" "}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <AgentStatusIndicator />
          </div>
        </div>
      </nav>

      <div className="py-4 max-w-7xl mx-auto relative z-10">
        {/* Main content - Improved Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* First Column - Agent Profile Card */}
          <motion.div
            className="lg:col-span-1 bg-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/30 shadow-sm h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{
              y: -3,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex flex-col items-center gap-4 h-full justify-between">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <motion.div
                    className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                  <div className="relative w-24 h-24 rounded-2xl  flex items-center justify-center">
                    <Image
                      src="/Asol_p.svg"
                      alt="ASOL"
                      width={96}
                      height={96}
                      className="rounded-none"
                      priority
                    />{" "}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center">
                  ASOL AI Agent
                </h2>
                <p className="text-center text-muted-foreground text-sm mt-2">
                  Autonomous blockchain intelligence engine
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="flex items-center gap-2 bg-card/60 px-4 py-1 ml-4 rounded-lg cursor-pointer border-0 mt-4"
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="font-mono text-xs">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary text-primary-foreground">
                      {copied ? "Copied!" : "Copy address"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Status indicators */}
              <div className="w-full mt-auto space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Agent Status
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Current Network
                  </span>
                  <span className="text-xs font-medium">Solana Chain</span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Last Update
                  </span>
                  <span className="text-xs font-medium">{timeAgo}</span>
                </div> */}
              </div>
            </div>
          </motion.div>

          {/* Second Column - Data Cards stacked vertically */}
          <div className="lg:col-span-1  grid grid-cols-1 gap-6 h-full">
            <DataCard
              icon={<Database className="w-5 h-5" />}
              title="Network Events"
              value={events.value.toLocaleString()}
              trend={2.4}
              loading={events.loading}
              accentColor="text-blue-500"
            />
            <DataCard
              icon={<LineChart className="w-5 h-5" />}
              title="Active Tasks"
              value={tasks.value.toLocaleString()}
              trend={-1.2}
              loading={tasks.loading}
              accentColor="text-violet-500"
            />
          </div>

          {/* Third Column - Portfolio Card */}
          <div className="lg:col-span-2">
            <PortfolioCard
              loading={isPortfolioLoading}
              portfolioData={positions}
              timeAgo={timeAgo}
              onRefresh={refreshPortfolio}
              totalValue={totalValue}
              otherValue={otherValue}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Modified DataCard component to ensure consistent height
const DataCard = ({
  icon,
  title,
  value,
  trend,
  loading,
  accentColor = "text-primary",
  bgColor = "bg-card/40",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: number;
  loading: boolean;
  accentColor?: string;
  bgColor?: string;
}) => {
  return (
    <motion.div
      className={`${bgColor} backdrop-blur-sm p-6 rounded-xl border border-border/30 shadow-sm relative overflow-hidden group h-full flex flex-col`}
      whileHover={{ y: -3, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <div
            className={`w-10 h-10 ${accentColor.replace(
              "text-",
              "bg-"
            )}/10 rounded-xl flex items-center justify-center ${accentColor} transform transition-transform group-hover:scale-110`}
          >
            {icon}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide">
            {title}
          </h3>
        </div>
        {/* {trend !== undefined && (
          <div className="flex items-center px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/30">
            {trend > 0 ? (
              <TrendingUp
                className="text-emerald-500 w-4 h-4 mr-1"
                strokeWidth={2.5}
              />
            ) : (
              <TrendingDown
                className="text-rose-500 w-4 h-4 mr-1"
                strokeWidth={2.5}
              />
            )}
            <span
              className={`text-xs font-semibold ${
                trend > 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )} */}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 h-6 bg-muted/50 rounded-lg animate-pulse"
          />
        ) : (
          <motion.div
            key="value"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mt-4"
          >
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {value}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Modified PortfolioCard component for consistent height
const PortfolioCard = ({
  loading,
  portfolioData,
  timeAgo,
  onRefresh,
  totalValue,
  otherValue,
}: {
  loading: boolean;
  portfolioData: Array<{
    token: string;
    value: number;
    color?: string;
    percentage?: string;
  }>;
  timeAgo: string;
  onRefresh: () => void;
  totalValue: number;
  otherValue: number;
}) => {
  // Calculate total with others
  const totalWithOthers = totalValue + otherValue;

  // Prepare data for pie chart
  const chartData = [...portfolioData];
  if (otherValue > 0) {
    chartData.push({
      token: "Others",
      value: otherValue,
      percentage: ((otherValue / totalWithOthers) * 100).toFixed(1),
      color: getOthersColor(),
    });
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border border-border shadow-lg">
          <p className="font-bold">{data.token}</p>
          <p className="text-sm">${data.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {data.percentage}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-card/40 backdrop-blur-sm p-6 rounded-xl border border-border/30 shadow-sm relative overflow-hidden h-full flex flex-col"
      whileHover={{ y: -3, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 transform transition-transform group-hover:scale-110">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide">
            Portfolio
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Updated {timeAgo}</span>
          </div>
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 text-muted-foreground ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-40 bg-muted/50 rounded-lg animate-pulse flex-grow"
          />
        ) : (
          <motion.div
            key="portfolio-content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex flex-col flex-grow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold">
                ${totalWithOthers.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 flex-grow">
              <div className="h-32 md:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="token"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={1}
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {portfolioData.slice(0, 5).map((pos) => (
                  <div
                    key={pos.token}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pos.color }}
                      />
                      <span className="text-xs font-medium truncate max-w-24">
                        {pos.token}
                      </span>
                    </div>
                    <div className="text-xs font-medium">{pos.percentage}%</div>
                  </div>
                ))}
                {portfolioData.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{portfolioData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
