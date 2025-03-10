"use client"
 import { useState } from 'react';
import Head from 'next/head';

// Mock data
const tasks = [
  { id: 1, name: 'One-on-One Meeting', priority: 'High', dueDate: 'Today', status: 'IN PROGRESS' },
  { id: 2, name: 'Send a summary email to stakeholders', priority: 'Low', dueDate: '3 days left', status: 'IN PROGRESS' },
  { id: 3, name: 'Review project proposals', priority: 'Medium', dueDate: 'Tomorrow', status: 'TO DO' },
  { id: 4, name: 'Update meeting agenda', priority: 'Low', dueDate: 'Friday', status: 'UPCOMING' },
];

const projects = [
  { id: 1, name: 'Product launch', tasks: 6, teammates: 12, color: 'purple' },
  { id: 2, name: 'Team brainstorm', tasks: 2, teammates: 32, color: 'blue' },
  { id: 3, name: 'Branding launch', tasks: 4, teammates: 8, color: 'teal' },
];

const goals = [
  { id: 1, name: 'Check Emails and Messages', project: 'Product launch', progress: 73 },
  { id: 2, name: 'Prepare a brief status update to the client', project: 'Product launch', progress: 11 },
  { id: 3, name: 'Update project documentation', project: 'Team brainstorm', progress: 63 },
];

const reminders = [
  { id: 1, text: 'Assess any new risks identified in the morning meeting.' },
  { id: 2, text: 'Outline key points for tomorrow\'s stand-up meeting.' },
];

export default function Dashboard() {
  const [userName, setUserName] = useState('Courtney');
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  // Function to generate color classes based on project color
  const getProjectColor = (color) => {
    switch(color) {
      case 'purple': return 'bg-purple-500';
      case 'blue': return 'bg-blue-500';
      case 'teal': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Function to generate priority classes
  const getPriorityClass = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Head>
        <title>Dashboard | Prodify</title>
        <meta name="description" content="Prodify Dashboard" />
      </Head>

      <div className="flex">
        {/* Left Sidebar Navigation */}


        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-6">
            <p className="text-gray-500 mb-1">{dateString}</p>
            <h1 className="text-3xl font-bold mb-2">Hello, {userName}</h1>
            <h2 className="text-2xl text-emerald-400 font-semibold mb-4">How can I help you today?</h2>
            
            <div className="flex space-x-4 mt-4">
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full">
                ➤ Ask AI
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full">
                Get tasks updates
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full">
                Create workspace
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full">
                Connect apps
              </button>
            </div>
          </div>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks Section - Spans 2 columns */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="font-semibold text-lg">My Tasks</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span>IN PROGRESS</span>
                  <span className="text-xs text-gray-500">• 3 tasks</span>
                </div>
              </div>
              
              {/* Task items */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                    <span>One-on-One Meeting</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full">High</span>
                    <span className="text-xs text-red-500">Today</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                    <span>Send a summary email to stakeholders</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Low</span>
                    <span className="text-xs text-gray-500">3 days left</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                    <span>Identify any blockers and plan solutions</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Low</span>
                    <span className="text-xs text-gray-500">5 days left</span>
                  </div>
                </div>
              </div>
              
              <button className="text-sm text-purple-600 flex items-center gap-1 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add task
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-md">
                  <span>TO DO</span>
                  <span className="text-xs text-gray-500">• 1 task</span>
                </div>
              </div>
              
              {/* To Do task */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Communication with a team</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Normal</span>
                    <span className="text-xs text-gray-500">4 days left</span>
                  </div>
                </div>
              </div>
              
              <button className="text-sm text-purple-600 flex items-center gap-1 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add task
              </button>
            </div>
          </div>
            
            {/* Projects Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <h2 className="font-semibold">Projects</h2>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Recents</span>
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Create Project Card */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4 flex items-center justify-center">
                <button className="flex flex-col items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">Create new project</span>
                </button>
              </div>
              
{/* Project Cards */}
<div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-md ${getProjectColor(project.color)} flex items-center justify-center text-white`}>
                        {project.color === 'purple' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : project.color === 'blue' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-xs text-gray-500">{project.tasks} tasks • {project.teammates} teammates</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Calendar Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h2 className="font-semibold">Calendar</h2>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium">July</span>
                    <button className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Calendar Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Week Calendar */}
                  <div className="flex space-x-1">
                    {['04', '05', '06', '07', '08', '09', '10'].map((day, index) => {
                      const weekday = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'][index];
                      const isToday = day === '07';
                      return (
                        <div key={day} className={`flex flex-col items-center p-1 ${isToday ? 'bg-purple-500 text-white' : ''} rounded-md w-10`}>
                          <span className="text-xs">{weekday}</span>
                          <span className={`text-sm font-semibold`}>{day}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Meeting information */}
                <div className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">Meeting with VP</h3>
                    <button className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Today • 10:00 - 11:00 am</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z" />
                      </svg>
                      <span className="text-sm text-gray-600">Google Meet</span>
                    </div>
                    
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">CH</div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">JD</div>
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">AL</div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-white text-xs">KS</div>
                      <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-white text-xs">+2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Goals Section - Spans 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <h2 className="font-semibold">My Goals</h2>
              </div>
              
              {/* Goal Progress Bars */}
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">{goal.name}</h3>
                      <span className="text-sm text-gray-500">{goal.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{goal.project} • My Projects</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`rounded-full h-1.5 ${
                          goal.progress < 30 ? 'bg-orange-400' : 
                          goal.progress < 70 ? 'bg-purple-400' : 
                          'bg-teal-400'
                        }`} 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reminders Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <h2 className="font-semibold">Reminders</h2>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <button className="text-gray-500 transform rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium">Today</span>
                  <span className="text-xs text-gray-500">• 2</span>
                </div>
                
                <div className="space-y-3">
                  {reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between group">
                      <p className="text-sm">{reminder.text}</p>
                      <div className="hidden group-hover:flex space-x-1">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}