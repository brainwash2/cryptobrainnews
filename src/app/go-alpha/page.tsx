import React from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

export default function GoAlpha() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div className="inline-block bg-primary text-black font-bold px-3 py-1 text-sm mb-6">THE DEFIANT ALPHA</div>
            <h1 className="text-6xl font-bold font-serif mb-6 leading-tight">
              Join <span className="text-primary underline decoration-4 underline-offset-8">Alpha.</span><br/>
              Learn Together.<br/>
              Earn Together.
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              The premium subscription designed for crypto natives who want to up their game. Get institutional-grade reports, private discord access, and yield farming strategies.
            </p>
            <button className="bg-primary text-black text-lg font-bold px-8 py-4 rounded-none hover:bg-white transition-colors">
              Try Free for 21 Days
            </button>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-8 h-96 flex items-center justify-center">
             <div className="text-center">
               <Icon name="LockClosedIcon" className="mx-auto text-primary mb-4" size={64} />
               <p className="text-gray-500 font-mono">PREMIUM CONTENT LOCKED</p>
             </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-center text-3xl font-bold font-serif mb-12">Choose Your Edge</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Monthly */}
            <div className="border border-gray-800 p-8 hover:border-gray-600 transition-colors">
              <h3 className="text-primary font-bold mb-2">Alpha Monthly</h3>
              <div className="text-4xl font-bold mb-6">$15 <span className="text-sm text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Daily Alpha Newsletter</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> 200+ Premium Tutorials</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Private Telegram Group</li>
              </ul>
              <button className="w-full border border-white py-3 font-bold hover:bg-white hover:text-black transition-colors">CHOOSE PLAN</button>
            </div>

            {/* Yearly (Highlighted) */}
            <div className="border-2 border-primary bg-gray-900 p-8 transform scale-105 relative">
              <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-2 py-1">BEST VALUE</div>
              <h3 className="text-primary font-bold mb-2">Alpha Yearly</h3>
              <div className="text-4xl font-bold mb-6">$144 <span className="text-sm text-gray-500 font-normal">/yr</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> All Monthly Features</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Exclusive Analyst Calls</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Early Access to Reports</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Save 20% vs Monthly</li>
              </ul>
              <button className="w-full bg-primary text-black py-3 font-bold hover:bg-white transition-colors">SELECTED</button>
            </div>

            {/* Crypto Payment */}
            <div className="border border-gray-800 p-8 hover:border-gray-600 transition-colors">
              <h3 className="text-primary font-bold mb-2">Pay with Crypto</h3>
              <div className="text-4xl font-bold mb-6">$108 <span className="text-sm text-gray-500 font-normal">/yr</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Pay with USDC/ETH</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> No Recurring Fees</li>
                <li className="flex gap-2"><Icon name="CheckIcon" className="text-primary" size={16}/> Save 40% vs Monthly</li>
              </ul>
              <button className="w-full border border-white py-3 font-bold hover:bg-white hover:text-black transition-colors">CONNECT WALLET</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
