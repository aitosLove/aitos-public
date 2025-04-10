import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  CloudLightning 
} from 'lucide-react';

const ModernEventPool = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  
  // Sample data
  const events = [
    {
      id: "1",
      name: "Market Data Update",
      description: "Successfully updated latest market data",
      timestamp: "14:32:07",
      status: "success"
    },
    {
      id: "2",
      name: "Alarm Triggered",
      description: "Price change alarm triggered for BTC/USD",
      timestamp: "14:28:45",
      status: "warning"
    },
    {
      id: "3",
      name: "API Error",
      description: "Failed to connect to external data provider",
      timestamp: "13:56:12",
      status: "error"
    },
    {
      id: "4",
      name: "Portfolio Rebalanced",
      description: "Portfolio automatically rebalanced based on predefined rules",
      timestamp: "13:45:30",
      status: "success"
    },
    {
      id: "5",
      name: "System Update",
      description: "System updated to latest version",
      timestamp: "12:15:22",
      status: "success"
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <CloudLightning className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      event.description.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <div className="modern-card p-6 h-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
            <CloudLightning className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Event Pool</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">System event monitoring</p>
          </div>
        </div>
        
        <button 
          className="modern-button secondary icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'spin' : ''}`} />
        </button>
      </div>
      
      {/* Search & Filter */}
      <div className="mb-5 relative">
        <div className="input-wrapper">
          <Search className="input-icon h-4 w-4" />
          <input
            type="text"
            placeholder="Filter events..."
            className="modern-input"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
      </div>
      
      {/* Events List */}
      <div className="space-y-3 overflow-auto max-h-96 pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="modern-timeline">
            <div className="modern-timeline-line"></div>
            
            {filteredEvents.map((event) => (
              <div key={event.id} className="modern-timeline-item">
                <div className="modern-timeline-dot"></div>
                <div className="modern-card p-4 hover:shadow-sm transition-all duration-150">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{event.name}</h3>
                    </div>
                    <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                      {event.timestamp}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernEventPool;