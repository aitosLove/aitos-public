import React, { useState } from 'react';
import { 
  Timer, 
  Webhook, 
  Radio, 
  RefreshCw,
  AlertCircle,
  Zap,
  PlusCircle,
  Clock,
  Activity
} from 'lucide-react';

const ModernEventPump = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sample data
  const eventPumps = [
    {
      id: "1",
      name: "Market Insight Update",
      type: "timer",
      status: "active",
      lastTriggered: "14:32:07",
      description: "Updates market insights every 5 minutes",
      interval: "5m"
    },
    {
      id: "2",
      name: "Portfolio Data Update",
      type: "hook",
      status: "active",
      lastTriggered: "14:28:45",
      description: "Refreshes portfolio data every 10 minutes",
      interval: "10m"
    },
    {
      id: "3",
      name: "Adjust Portfolio",
      type: "listener",
      status: "error",
      lastTriggered: "13:56:12",
      description: "Automatically adjusts portfolio based on market insights",
      interval: "On event"
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPumpTypeIcon = (type) => {
    switch (type) {
      case "timer":
        return <Timer className="h-5 w-5" />;
      case "hook":
        return <Webhook className="h-5 w-5" />;
      case "listener":
        return <Radio className="h-5 w-5" />;
      default:
        return <Timer className="h-5 w-5" />;
    }
  };

  return (
    <div className="modern-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Event Pump</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automated processes and triggers</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="modern-button secondary icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'spin' : ''}`} />
          </button>
          
          <button className="modern-button primary">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Pump
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {eventPumps.map((pump) => (
          <div 
            key={pump.id} 
            className="modern-card overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Status Bar */}
            <div className={`px-4 py-1.5 text-xs font-medium flex justify-between items-center
                ${pump.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}
            >
              <div className="flex items-center space-x-1.5">
                <span className={`status-dot ${pump.status === 'active' ? 'active' : 'error'}`}></span>
                <span>{pump.status === 'active' ? 'Active' : 'Error'}</span>
              </div>
              <span className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 opacity-70" />
                <span>{pump.interval}</span>
              </span>
            </div>
            
            {/* Main Content */}
            <div className="p-4">
              <div className="flex items-start mb-4">
                <div className="p-2 mr-3 bg-amber-50 dark:bg-gray-800 rounded-lg">
                  {getPumpTypeIcon(pump.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{pump.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pump.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center text-xs text-gray-500">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  <span>Last: {pump.lastTriggered}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-xs py-1 px-2 text-gray-500 hover:text-amber-500 transition-colors">Details</button>
                  <button className="text-xs py-1 px-2 text-amber-500 hover:text-amber-600 transition-colors">Configure</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernEventPump;