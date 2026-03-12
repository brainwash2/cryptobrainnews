'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/components/providers/Web3Provider';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { Shield, Plus, Save, Download, ArrowLeft, PlayCircle, Filter, Zap, Terminal } from 'lucide-react';
import Link from 'next/link';

type Step = { id: string; type: 'trigger' | 'condition' | 'action'; config: any };

export default function PlaybookBuilder() {
  const { address, signature, siweMessage } = useWeb3();
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const[isBuilding, setIsBuilding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Builder State
  const [name, setName] = useState('New Arbitrage Playbook');
  const [description, setDescription] = useState('Executes L402 swap when TVL spikes.');
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (!address || !signature || !siweMessage) return;
    fetchPlaybooks();
  }, [address, signature, siweMessage]);

  const fetchPlaybooks = async () => {
    try {
      const res = await fetch(`/api/operator/playbooks?pubkey=${address}`, {
        headers: { 'x-siwe-signature': signature!, 'x-siwe-message': siweMessage! }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data.playbooks);
      }
    } catch (err) {
      console.error('Failed to fetch playbooks', err);
    }
  };

  const addStep = (type: 'trigger' | 'condition' | 'action') => {
    const newStep: Step = { 
      id: Math.random().toString(36).substring(7), 
      type, 
      config: type === 'trigger' ? { source: '/api/oracle/airdrops', interval: '60m' } :
              type === 'condition' ? { field: 'tvl', operator: '>', value: 50000000 } :
              { endpoint: '/api/execute', payload: { action: 'bridge' } }
    };
    setSteps([...steps, newStep]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = { name, description, schema_json: { steps } };
      const res = await fetch(`/api/operator/playbooks?pubkey=${address}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-siwe-signature': signature!, 
          'x-siwe-message': siweMessage! 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsBuilding(false);
        setSteps([]);
        fetchPlaybooks();
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ name, description, steps }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${name.replace(/\s+/g, '_').toLowerCase()}.json`);
    dlAnchorElem.click();
  };

  if (!address || !signature) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 font-sans">
        <Shield size={64} className="text-[#333] mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Playbook Builder</h1>
        <p className="text-[#888] font-mono mb-8 text-center max-w-md">Authenticate to compose and manage AI agent orchestrations.</p>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        
        <div className="flex justify-between items-center border-b border-[#222] pb-6">
          <div>
            <Link href="/dashboard" className="text-[#888] hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#FABF2C]">Agent Playbooks</h1>
            <p className="text-[#888] font-mono text-sm mt-2">Design, save, and export multi-step execution schemas.</p>
          </div>
          <ConnectWallet />
        </div>

        {!isBuilding ? (
          <div className="space-y-6">
            <button onClick={() => setIsBuilding(true)} className="bg-white text-black px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-[#FABF2C] transition-colors flex items-center gap-2">
              <Plus size={16} /> Create Playbook
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playbooks.map(pb => (
                <div key={pb.id} className="bg-[#0a0a0a] border border-[#222] p-6 rounded hover:border-[#FABF2C] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Terminal size={18} className="text-[#00d672]" />
                    <h3 className="font-black uppercase tracking-widest text-lg">{pb.name}</h3>
                  </div>
                  <p className="text-[#888] font-mono text-xs mb-4">{pb.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-[#222]">
                    <span className="text-[10px] text-[#555] font-mono">{new Date(pb.created_at).toLocaleDateString()}</span>
                    <button onClick={() => {
                       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pb.schema_json, null, 2));
                       const a = document.createElement('a');
                       a.href = dataStr;
                       a.download = `${pb.name.replace(/\s+/g, '_')}.json`;
                       a.click();
                    }} className="text-[#FABF2C] hover:text-white flex items-center gap-1 text-[10px] uppercase font-black tracking-widest transition-colors">
                      <Download size={12} /> JSON Schema
                    </button>
                  </div>
                </div>
              ))}
              {playbooks.length === 0 && (
                <div className="col-span-full text-center p-12 border border-dashed border-[#222] rounded text-[#555] font-mono text-sm">
                  No orchestrations saved yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">Playbook Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-[#222] px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#FABF2C]" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black border border-[#222] px-4 py-3 text-xs font-mono text-[#888] outline-none focus:border-[#FABF2C]" />
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center mt-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.type === 'trigger' ? 'border-[#00d672] text-[#00d672]' :
                      step.type === 'condition' ? 'border-[#FABF2C] text-[#FABF2C]' : 'border-[#ff9900] text-[#ff9900]'
                    }`}>
                      {step.type === 'trigger' ? <PlayCircle size={14} /> : step.type === 'condition' ? <Filter size={14} /> : <Zap size={14} />}
                    </div>
                    {index < steps.length - 1 && <div className="w-0.5 h-full bg-[#222] mt-2" />}
                  </div>
                  <div className="flex-1 bg-[#111] border border-[#222] p-4 rounded mt-2 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#888] mb-1">{step.type} Block</p>
                      <pre className="text-xs font-mono text-white">{JSON.stringify(step.config)}</pre>
                    </div>
                    <button onClick={() => setSteps(steps.filter(s => s.id !== step.id))} className="text-[#555] hover:text-red-500 text-xs uppercase font-black tracking-widest transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => addStep('trigger')} className="flex-1 border border-[#00d672]/30 text-[#00d672] py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#00d672] hover:text-black transition-colors flex justify-center items-center gap-2">
                <PlayCircle size={14} /> Add Trigger
              </button>
              <button onClick={() => addStep('condition')} className="flex-1 border border-[#FABF2C]/30 text-[#FABF2C] py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#FABF2C] hover:text-black transition-colors flex justify-center items-center gap-2">
                <Filter size={14} /> Add Condition
              </button>
              <button onClick={() => addStep('action')} className="flex-1 border border-[#ff9900]/30 text-[#ff9900] py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] hover:text-black transition-colors flex justify-center items-center gap-2">
                <Zap size={14} /> Add Action
              </button>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-[#222]">
              <button onClick={handleExport} className="bg-[#111] border border-[#333] text-white px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-[#222] transition-colors flex items-center gap-2">
                <Download size={16} /> Export JSON
              </button>
              <button onClick={handleSave} disabled={isLoading || steps.length === 0} className="bg-[#FABF2C] text-black px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50">
                <Save size={16} /> {isLoading ? 'Saving...' : 'Save Playbook'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
