'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

type NodeStatus = 'ACTIVE' | 'HIGH LOAD' | 'FAILED';

interface NodeData {
  id: string;
  name: string;
  status: NodeStatus;
  users: number;
  requests: number;
  load: number;
}

export default function InfrastructureMonitor() {
  const router = useRouter();
  
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: 'A', name: 'Node A', status: 'ACTIVE', users: 120, requests: 430, load: 24 },
    { id: 'B', name: 'Node B', status: 'ACTIVE', users: 115, requests: 410, load: 22 },
    { id: 'C', name: 'Node C', status: 'ACTIVE', users: 130, requests: 455, load: 27 },
  ]);

  const [activeUsers, setActiveUsers] = useState(350);
  const [requestsPerMin, setRequestsPerMin] = useState(820);
  const [trafficStatus, setTrafficStatus] = useState('Normal');
  const [lbStatus, setLbStatus] = useState('Healthy');
  const [lbMessage, setLbMessage] = useState('Routing requests across nodes');
  const [isSimulating, setIsSimulating] = useState(false);
  const [chartHeights, setChartHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated() || auth.getRole() !== 'manager') {
      // router.push('/login'); // Temporarily allow for dev
    }

    // Initial random heights
    setChartHeights([...Array(20)].map(() => 20 + Math.random() * 60));

    const interval = setInterval(() => {
        if (!isSimulating) {
            // Natural fluctuation
            setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            setRequestsPerMin(prev => prev + (Math.random() > 0.5 ? 5 : -5));
            
            // Fluctuating chart bars
            setChartHeights(prev => prev.map(h => {
              const delta = (Math.random() - 0.5) * 10;
              return Math.max(10, Math.min(90, h + delta));
            }));
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const simulateHighTraffic = async () => {
    setIsSimulating(true);
    setTrafficStatus('Spiking...');
    
    // Step 1: Rapid increase on Node A
    for (let i = 0; i <= 10; i++) {
        setNodes(curr => curr.map(n => n.id === 'A' ? {
            ...n, 
            users: n.users + 100, 
            load: Math.min(n.load + 7, i === 10 ? 92 : 100),
            status: i > 5 ? 'HIGH LOAD' : 'ACTIVE'
        } : n));
        setActiveUsers(prev => prev + 100);
        setRequestsPerMin(prev => prev + 250);
        await new Promise(r => setTimeout(r, 200));
    }

    setLbMessage('High traffic detected on Node A. Redistributing traffic across nodes...');
    setTrafficStatus('BURST TRAFFIC');
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Distribution to B and C
    setLbMessage('Optimizing cluster load...');
    for (let i = 0; i <= 15; i++) {
        setNodes(curr => {
            const nodeA = curr.find(n => n.id === 'A')!;
            const nodeB = curr.find(n => n.id === 'B')!;
            const nodeC = curr.find(n => n.id === 'C')!;

            return curr.map(n => {
                if (n.id === 'A' && n.users > 620) return { ...n, users: n.users - 50, load: n.load - 2, status: 'ACTIVE' };
                if (n.id === 'B' && n.users < 520) return { ...n, users: n.users + 30, load: n.load + 2 };
                if (n.id === 'C' && n.status !== 'FAILED' && n.users < 500) return { ...n, users: n.users + 25, load: n.load + 1.5 };
                return n;
            });
        });
        await new Promise(r => setTimeout(r, 100));
    }

    setLbMessage('Traffic balanced successfully. System operating normally.');
    setTrafficStatus('Stabilized');
    setIsSimulating(false);
  };

  const simulateNodeFailure = () => {
    setLbStatus('Degraded');
    setLbMessage('Node C unreachable. Redirecting requests to remaining nodes...');
    
    setNodes(curr => {
        const nodeC = curr.find(n => n.id === 'C')!;
        const overflow = nodeC.users;
        
        return curr.map(n => {
            if (n.id === 'C') return { ...n, status: 'FAILED', users: 0, load: 0 };
            if (n.id === 'A') return { ...n, users: n.users + Math.floor(overflow/2), load: n.load + 15 };
            if (n.id === 'B') return { ...n, users: n.users + Math.ceil(overflow/2), load: n.load + 15 };
            return n;
        });
    });
  };

  const restoreNode = () => {
    setLbStatus('Healthy');
    setLbMessage('Node C restored and rejoined cluster. Re-balancing traffic...');
    
    setNodes(curr => {
        const nodeA = curr.find(u => u.id === 'A')!;
        const nodeB = curr.find(u => u.id === 'B')!;

        return curr.map(n => {
            if (n.id === 'C') return { ...n, status: 'ACTIVE', users: 130, load: 27 };
            if (n.id === 'A') return { ...n, users: n.users - 65, load: n.load - 12 };
            if (n.id === 'B') return { ...n, users: n.users - 65, load: n.load - 12 };
            return n;
        });
    });
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-black rounded-md">ACTIVE</span>;
      case 'HIGH LOAD': return <span className="px-2 py-1 bg-amber/10 text-amber-700 text-[10px] font-black rounded-md animate-pulse">HIGH LOAD</span>;
      case 'FAILED': return <span className="px-2 py-1 bg-danger/10 text-danger text-[10px] font-black rounded-md">FAILED</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-soft border border-border">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push('/manager')}
            className="mt-1 h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-slate-50 text-navy hover:bg-white hover:shadow-md transition-all group"
            title="Back to Manager Dashboard"
          >
            <svg className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-navy tracking-tight">Infrastructure Monitor</h1>
            <p className="text-muted font-medium mt-1">Real-time monitoring of system nodes and traffic.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={simulateHighTraffic}
            disabled={isSimulating}
            className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-all shadow-md disabled:opacity-50"
          >
            Simulate High Traffic
          </button>
          <button 
            onClick={simulateNodeFailure}
            className="px-4 py-2 bg-danger/10 text-danger text-xs font-bold rounded-xl hover:bg-danger/20 transition-all border border-danger/20"
          >
            Simulate Node Failure
          </button>
          <button 
            onClick={restoreNode}
            className="px-4 py-2 bg-success/10 text-success text-xs font-bold rounded-xl hover:bg-success/20 transition-all border border-success/20"
          >
            Restore Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: Incoming Traffic */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-border flex flex-col">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest mb-6">System Traffic</h2>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-black text-navy uppercase tracking-tighter">Active Users</span>
              <span className="text-3xl font-black text-amber-600 tabular-nums tracking-tighter">{activeUsers.toLocaleString()}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-black text-navy uppercase tracking-tighter">Requests per Minute</span>
              <span className="text-3xl font-black text-amber-600 tabular-nums tracking-tighter">{requestsPerMin.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-navy">Traffic Status</span>
              <span className={`text-sm font-black uppercase tracking-widest ${trafficStatus === 'Normal' ? 'text-success' : 'text-amber-600'}`}>
                {trafficStatus}
              </span>
            </div>
            {/* Visual graph placeholder */}
            <div className="h-24 w-full bg-slate-100 rounded-2xl overflow-hidden flex items-end gap-1 px-4 pb-4">
                {chartHeights.map((height, i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-amber/30 rounded-t-sm transition-all duration-500" 
                        style={{ height: `${height}%` }}
                    ></div>
                ))}
            </div>
          </div>
        </div>

        {/* Section 2: Load Balancer */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-border flex flex-col relative">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest mb-6 text-center">Load Balancer</h2>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-10">
            <div className="relative group">
                <div className="absolute -inset-8 bg-amber/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative h-36 w-36 rounded-full border-8 border-navy flex flex-col items-center justify-center bg-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)] z-10 transition-transform group-hover:scale-110 duration-500">
                    <svg className="h-12 w-12 text-navy mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-[10px] font-black tracking-widest uppercase text-navy">LOAD BALANCER</span>
                </div>
                {/* Simulated Arrows */}
                <div className="absolute top-1/2 left-full w-24 h-px bg-gradient-to-r from-navy to-transparent -translate-y-1/2 z-0 hidden lg:block opacity-50"></div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-muted">Status: <span className={lbStatus === 'Healthy' ? 'text-success' : 'text-danger'}>{lbStatus}</span></p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[60px] flex items-center justify-center">
                    <p className="text-xs font-bold text-navy italic">{lbMessage}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Section 3: Node Cluster */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest px-2">System Nodes</h2>
          {nodes.map(node => (
            <div 
                key={node.id} 
                className={`p-5 rounded-2xl bg-white shadow-soft transition-all duration-500 border-2 ${
                    node.status === 'FAILED' ? 'border-danger bg-danger/5 shadow-danger/20 scale-95 opacity-80' : 
                    node.status === 'HIGH LOAD' ? 'border-amber shadow-amber/20' : 
                    'border-transparent'
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${node.status === 'ACTIVE' ? 'bg-success' : node.status === 'HIGH LOAD' ? 'bg-amber animate-ping' : 'bg-danger'}`}></div>
                    <span className="font-black text-navy">{node.name}</span>
                </div>
                {getStatusBadge(node.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Users</p>
                   <p className="text-lg font-black text-navy tabular-nums">{node.users.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted uppercase tracking-widest">Load</p>
                   <p className="text-lg font-black text-navy tabular-nums">{node.load.toFixed(0)}%</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-700 rounded-full ${
                        node.load > 80 ? 'bg-danger' : 
                        node.load > 50 ? 'bg-amber' : 
                        'bg-success'
                    }`}
                    style={{ width: `${node.load}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-border flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-8">
            <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Nodes</p>
                <p className="text-xl font-black text-navy">{nodes.filter(n => n.status !== 'FAILED').length}/3</p>
            </div>
            <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Auto Failover</p>
                <p className="text-xl font-black text-success">Enabled</p>
            </div>
        </div>
        <div className="flex items-center gap-4 bg-navy text-white px-6 py-3 rounded-2xl shadow-xl">
             <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
             <span className="text-xs font-black uppercase tracking-widest">Overall Status: {nodes.some(n => n.status === 'FAILED') ? 'DEGRADED / REDIRECTING' : 'STABLE / OPERATIONAL'}</span>
        </div>
      </div>
    </div>
  );
}
