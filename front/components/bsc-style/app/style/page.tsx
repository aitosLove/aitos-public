// pages/dashboard.tsx
'use client'
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  MoreHorizontal, 
  User, 
  Calendar, 
  PhoneCall, 
  MessageSquare, 
  Search, 
  AreaChart, 
  Menu 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard () {
  // Sample data for charts
  const voicemailData = [
    { day: 'Sat', '300': 8, '500': 5, '700': 2, '900': 3 },
    { day: 'Sun', '300': 2, '500': 9, '700': 7, '900': 4 },
    { day: 'Mon', '300': 7, '500': 6, '700': 8, '900': 5 },
    { day: 'Tue', '300': 9, '500': 3, '700': 5, '900': 7 },
    { day: 'Wed', '300': 4, '500': 7, '700': 8, '900': 3 },
    { day: 'Thu', '300': 8, '500': 5, '700': 6, '900': 9 },
    { day: 'Fri', '300': 6, '500': 7, '700': 4, '900': 2 },
  ];

  const leadsData = [
    { day: 'Sat', value: 15 },
    { day: 'Sun', value: 25 },
    { day: 'Mon', value: 32 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 30 },
    { day: 'Thu', value: 28 },
  ];

  const marketingData = [
    { name: 'Direct', value: 74.9, color: '#d4ff77' },
    { name: 'Facebook', value: 58.8, color: '#ff9f66' },
    { name: 'Organic Search', value: 73.7, color: '#d4ff77' },
    { name: 'Instagram', value: 50.6, color: '#d4ff77' },
    { name: 'Paid Search', value: 88.5, color: '#a78bfa' },
  ];

  const agentPerformanceData = {
    newLeads: [40, 45, 50, 55, 60, 65, 70],
    bookedAppts: [30, 35, 40, 45, 50, 55, 60],
    conversionRate: [50, 55, 60, 65, 70, 75, 80]
  };

  const reasonsNotBookedData = [
    { day: 'Sat', value: 25 },
    { day: 'Sun', value: 15 },
    { day: 'Mon', value: 35 },
    { day: 'Tue', value: 30 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 25 },
  ];

  return (
    <div className="min-h-screen bg-zinc-200">
      {/* Sidebar and Header */}
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 bottom-0 w-16 bg-black flex flex-col items-center py-4 gap-6">
          <div className="p-2 bg-lime-300 rounded-md">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-black">
              <path fill="currentColor" d="M13 3L4.8 15.7c-.1.2-.1.4 0 .6.1.2.3.2.5.2h4.2v4c0 .3.2.5.5.5h4c.3 0 .5-.2.5-.5v-4h4.2c.2 0 .4-.1.5-.2.1-.2.1-.4 0-.6L13 3z" />
            </svg>
          </div>
          <div className="flex flex-col gap-6 mt-6">
            <div className="p-2 text-gray-500 hover:text-lime-300">
              <Menu className="w-5 h-5" />
            </div>
            <div className="p-2 text-gray-500 hover:text-lime-300">
              <AreaChart className="w-5 h-5" />
            </div>
            <div className="p-2 text-gray-500 hover:text-lime-300">
              <User className="w-5 h-5" />
            </div>
            <div className="p-2 text-gray-500 hover:text-lime-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="p-2 text-gray-500 hover:text-lime-300">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-16 w-full">
          {/* Header */}
          <header className="bg-black p-3 flex justify-between items-center">
            <div className="flex items-center gap-3 ml-4">
              <div className="bg-lime-300 text-black p-2 rounded-full">
                <Menu className="w-5 h-5" />
              </div>
              <h1 className="text-white text-xl font-medium">Dashboard</h1>
            </div>
            <div className="flex items-center mr-4">
              <div className="bg-zinc-800 rounded-md flex items-center px-3 py-1 w-64">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Start Search Here..." 
                  className="bg-transparent text-sm text-gray-300 border-none focus:outline-none w-full"
                />
              </div>
              <div className="ml-6 flex items-center gap-2">
                <Button variant="ghost" className="p-2 text-gray-300 rounded-full">
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="p-2 text-gray-300 rounded-full">
                  <Calendar className="w-5 h-5" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
                  <span className="text-xs text-white">JD</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6 bg-black min-h-screen">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="p-2 text-lime-300 bg-zinc-900 rounded-full">
                  <AreaChart className="w-5 h-5" />
                </Button>
                <p className="text-white">All Product</p>
              </div>
              <div>
                <Button className="bg-lime-300 hover:bg-lime-400 text-black px-4 py-1 h-auto rounded-md font-medium">
                  Current Report <span className="ml-1">▼</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* New Patient Leads Card */}
              <Card className="bg-lime-200 text-black border-none rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-4 pt-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-lime-300 rounded-full mr-3">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">New Patient Leads</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">$45.56.20</h2>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        <span className="text-green-600 font-medium">60%</span>
                        <span className="text-zinc-700">This month</span>
                      </div>
                    </div>
                    <div className="h-12 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leadsData} barSize={4}>
                          <Bar dataKey="value" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booked Appts Card */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-4 pt-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-lime-300 rounded-full mr-3">
                      <Calendar className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm font-medium">Booked Appts</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">$18.56.20</h2>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <svg className="w-3 h-3 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        <span className="text-lime-300 font-medium">45%</span>
                        <span className="text-zinc-400">This month</span>
                      </div>
                    </div>
                    <div className="h-12 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leadsData} barSize={8}>
                          <Bar dataKey="value" fill="#d4ff77" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Rate Card */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-4 pt-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-lime-300 rounded-full mr-3">
                      <AreaChart className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">$28.56.20</h2>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <svg className="w-3 h-3 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        <span className="text-lime-300 font-medium">35%</span>
                        <span className="text-zinc-400">This month</span>
                      </div>
                    </div>
                    <div className="h-12 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={leadsData}>
                          <Line type="monotone" dataKey="value" stroke="#d4ff77" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SMS Utilization Card */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-4 pt-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-lime-300 rounded-full mr-3">
                      <MessageSquare className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm font-medium">SMS Utilization</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">$38.56.20</h2>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <svg className="w-3 h-3 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        <span className="text-lime-300 font-medium">25%</span>
                        <span className="text-zinc-400">This month</span>
                      </div>
                    </div>
                    <div className="h-12 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={leadsData}>
                          <Line type="monotone" dataKey="value" stroke="#d4ff77" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart rows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Avg Voicemail By Day */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-4 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-700 rounded-full">
                      <PhoneCall className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium text-white">Avg Voicemail By Day</CardTitle>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-300 opacity-50 rounded-full"></div>
                      <span className="text-zinc-400">&gt;300</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400 opacity-50 rounded-full"></div>
                      <span className="text-zinc-400">&gt;500</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 opacity-50 rounded-full"></div>
                      <span className="text-zinc-400">&gt;700</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-600 opacity-50 rounded-full"></div>
                      <span className="text-zinc-400">&gt;900</span>
                    </div>
                  </div>
                  <div className="h-48">
                    <div className="grid grid-cols-7 grid-rows-7 gap-1 h-full">
                      {Array.from({ length: 49 }).map((_, index) => {
                        const col = index % 7;
                        const row = Math.floor(index / 7);
                        const opacity = Math.random() > 0.5 ? 'opacity-50' : 'opacity-80';
                        const color = row < 2 ? 'bg-purple-300' : row < 4 ? 'bg-purple-400' : 'bg-purple-500';
                        return (
                          <div 
                            key={index}
                            className={`${color} ${opacity} rounded-md`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center mt-2 text-xs text-zinc-500">
                    <div>Sat</div>
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Leads By Day */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-4 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-700 rounded-full">
                      <AreaChart className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium text-white">Patient Leads By Day</CardTitle>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadsData} barSize={18}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#d4ff77">
                          {leadsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={index === 3 ? 1 : 0.5} radius={[4, 4, 0, 0]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-col items-center">
                    <div className="text-lime-300 text-2xl font-bold">257,413</div>
                    <div className="text-xs text-zinc-400">Oct 25, 2024</div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Agents */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-4 pb-0 flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Top Performing Agents</CardTitle>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-300">New Leads Answered</span>
                        <span className="text-sm text-lime-300">Kelsey 27%</span>
                      </div>
                      <div className="h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={agentPerformanceData.newLeads.map((value, i) => ({ day: i, value }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#d4ff77" 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-300">Most Appts Booked</span>
                        <span className="text-sm text-blue-400">Marsha 32%</span>
                      </div>
                      <div className="h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={agentPerformanceData.bookedAppts.map((value, i) => ({ day: i, value }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#818cf8" 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-300">Highest Conv. Rate</span>
                        <span className="text-sm text-orange-300">Marsha 86%</span>
                      </div>
                      <div className="h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={agentPerformanceData.conversionRate.map((value, i) => ({ day: i, value }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#fb923c" 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom row charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top 5 Marketing Channels */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-4 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-700 rounded-full">
                      <Search className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium text-white">Top 5 Marketing Channels</CardTitle>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={marketingData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {marketingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="500" fontSize="14">
                            Leads
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 ml-6">
                      <div className="text-sm text-zinc-400 mb-2">Total Leads</div>
                      <div className="space-y-3">
                        {marketingData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm text-zinc-300">{item.name}</span>
                            </div>
                            <span className="text-sm text-lime-300">${item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reasons Not Booked */}
              <Card className="bg-zinc-800 text-white border-none rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-4 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-700 rounded-full">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium text-white">Reasons Not Booked</CardTitle>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-6 gap-1 h-48">
                    {reasonsNotBookedData.map((item, index) => (
                      <div key={index} className="flex flex-col justify-end">
                        <div className="text-xs text-zinc-400 mb-1">{item.value}%</div>
                        <div 
                          className="bg-purple-500 opacity-70 rounded-md w-full" 
                          style={{ height: `${item.value * 2}px` }}
                        ></div>
                        <div className="text-xs text-zinc-400 mt-1">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

