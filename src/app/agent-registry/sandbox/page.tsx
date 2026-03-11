'use client';

import React, { useState } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, ShieldAlert, Zap } from 'lucide-react';

export default function AgentSandbox() {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('/api/execute');
  const[payload, setPayload] = useState('{\n  "action": "execute_arbitrage_swap",\n  "target_protocol": "uniswap_v3"\n}');
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [logs, setLogs] = useState<string[]>(['[System] Sandbox initialized. Ready for compute requests.']);
  const [isLoading, setIsLoading] = useState(false);

  const appendLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${msg}`]);

  const handleExecute = async () => {
    if (!apiKey) {
      appendLog('Error: API Key is required.');
      return;
    }

    setIsLoading(true);
    setLogs(['[System] Initiating request...']);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-sandbox-mode': isSandboxMode.toString()
      };

      // Handle Authentication Headers depending on endpoint type
      if (endpoint === '/api/execute') {
        headers['x-api-key'] = apiKey;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      appendLog(`POST ${endpoint}`);
      
      let res = await fetch(endpoint, {
        method: endpoint.includes('execute') ? 'POST' : 'GET',
        headers,
        body: endpoint.includes('execute') ? payload : undefined
      });

      // Handle L402 Flow automatically for Developer DX
      if (res.status === 402 && endpoint === '/api/execute') {
        appendLog('402 Payment Required. L402 Challenge received.');
        const authHeader = res.headers.get('www-authenticate');
        if (authHeader && authHeader.includes('macaroon=')) {
          const macaroonMatch = authHeader.match(/macaroon="([^"]+)"/);
          if (macaroonMatch) {
            appendLog('Extracted Macaroon. Simulating Lightning Payment...');
            // In Sandbox mode, we just echo the macaroon back. In live mode, they would pay the invoice here.
            await new Promise(r => setTimeout(r, 800)); 
            
            headers['Authorization'] = `L402 ${macaroonMatch[1]}:`;
            appendLog('Retrying request with L402 Authorization header...');
            
            res = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: payload
            });
          }
        }
      }

      const data = await res.json();
      appendLog(`Status: ${res.status} ${res.ok ? 'OK' : 'Error'}`);
      appendLog(`Response: \n${JSON.stringify(data, null, 2)}`);

    } catch (err: any) {
      appendLog(`Fatal Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 border-b border-[#222] pb-6 mb-8">
          <TerminalIcon className="text-[#FABF2C]" size={28} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Developer Console</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Pane: Configuration */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#888]">Agent Authentication</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#555]">Sandbox Mode</span>
                  <button 
                    onClick={() => setIsSandboxMode(!isSandboxMode)}
                    className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors ${isSandboxMode ? 'bg-[#FABF2C]' : 'bg-[#222]'}`}
                  >
                    <div className={`w-3 h-3 bg-black rounded-full shadow-md transform transition-transform ${isSandboxMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">API Key (KYA Identity)</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  placeholder="cbn_live_..." 
                  className="w-full bg-black border border-[#222] px-4 py-3 text-xs font-mono outline-none focus:border-[#FABF2C]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">Target Endpoint</label>
                <select 
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)} 
                  className="w-full bg-black border border-[#222] px-4 py-3 text-xs font-mono outline-none focus:border-[#FABF2C] appearance-none"
                >
                  <option value="/api/execute">POST /api/execute (L402 Compute)</option>
                  <option value="/api/oracle/airdrops">GET /api/oracle/airdrops (Data Feed)</option>
                </select>
              </div>

              {endpoint === '/api/execute' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">JSON Payload</label>
                  <textarea 
                    value={payload} 
                    onChange={(e) => setPayload(e.target.value)} 
                    rows={6}
                    className="w-full bg-black border border-[#222] px-4 py-3 text-xs font-mono outline-none focus:border-[#FABF2C]"
                  />
                </div>
              )}

              <button 
                onClick={handleExecute} 
                disabled={isLoading}
                className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-[#FABF2C] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {isLoading ? 'Executing...' : 'Send Request'}
              </button>
            </div>

            {!isSandboxMode && (
              <div className="bg-[#1a0f00] border border-[#ff9900]/30 p-4 rounded flex gap-4">
                <ShieldAlert className="text-[#ff9900] shrink-0" />
                <p className="text-xs text-[#ff9900]/80 font-mono">
                  Sandbox mode is disabled. Execution requests will require real Lightning Network invoices to settle and will permanently log to production analytics.
                </p>
              </div>
            )}
          </div>

          {/* Right Pane: Terminal Output */}
          <div className="bg-black border border-[#222] rounded flex flex-col overflow-hidden h-[600px]">
            <div className="bg-[#111] border-b border-[#222] p-3 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs whitespace-pre-wrap text-[#00d672]">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 opacity-90">{log}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
