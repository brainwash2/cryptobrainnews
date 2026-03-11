import React from 'react';

export default function DocsPage() {
  const CodeBlock = ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-black border border-[#222] p-4 rounded overflow-x-auto text-[#00d672] font-mono text-xs my-4 whitespace-pre-wrap">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="space-y-16 pb-24">
      
      {/* Introduction */}
      <section id="introduction" className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">CryptoBrain API Reference</h1>
        <p className="text-[#888] font-mono leading-relaxed">
          Welcome to the CryptoBrain Oracle API. Our infrastructure is designed natively for autonomous AI agents. 
          It provides high-fidelity on-chain analytics, airdrop vectors, and compute execution via a dual-layer 
          authentication system utilizing Cryptographic Identity and Lightning Network micro-transactions (L402).
        </p>
      </section>

      {/* Authentication - API Keys */}
      <section id="api-keys" className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#FABF2C]">1. Identity & API Keys</h2>
        <p className="text-[#888] font-mono leading-relaxed">
          All endpoints require Know Your Agent (KYA) registration. You must register your agent's ERC-8004 
          pubkey to receive an API Key. We hash these keys (SHA-256) instantly on the Edge; they are never stored in plain-text.
        </p>
        <p className="text-sm font-mono text-white mt-4">Header Requirement:</p>
        <CodeBlock>x-api-key: cbn_live_your_api_key_here</CodeBlock>
      </section>

      {/* Authentication - L402 */}
      <section id="l402-payments" className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#FABF2C]">2. L402 Lightning Payments</h2>
        <p className="text-[#888] font-mono leading-relaxed">
          Compute-heavy endpoints (like <code className="text-white">/api/execute</code>) require micro-payments. 
          When you make an initial request, the server returns a <strong>402 Payment Required</strong> response with a Macaroon and a Lightning Invoice.
        </p>
        <div className="bg-[#0a0a0a] border border-[#222] p-4 rounded font-mono text-xs text-[#888]">
          <span className="text-white font-bold">Flow:</span>
          <ol className="list-decimal pl-5 mt-2 space-y-2">
            <li>Send POST request with your payload.</li>
            <li>Receive 402 status with <code className="text-[#00d672]">WWW-Authenticate: L402 macaroon="...", invoice="..."</code></li>
            <li>Pay the invoice via a Lightning node or wallet.</li>
            <li>Retry the exact same request, attaching the Macaroon as your Authorization header.</li>
          </ol>
        </div>
        <CodeBlock>Authorization: L402 &lt;base64_macaroon&gt;:</CodeBlock>
        <p className="text-[#888] font-mono text-sm mt-2">
          <em>Note: To test this flow without spending real funds, pass the <code className="text-white">x-sandbox-mode: true</code> header.</em>
        </p>
      </section>

      {/* Endpoints */}
      <section id="api-execute" className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#00d672]">POST /api/execute</h2>
        <p className="text-[#888] font-mono leading-relaxed">
          Executes an agent compute action. Protected by L402. Logs execution securely tied to your Agent ID.
        </p>
        <CodeBlock>{`// Request Body (JSON)
{
  "action": "execute_arbitrage_swap",
  "target_protocol": "uniswap_v3"
}`}</CodeBlock>
      </section>

      <section id="api-oracle" className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#00d672]">GET /api/oracle/airdrops</h2>
        <p className="text-[#888] font-mono leading-relaxed">
          Retrieves the top tokenless DeFi protocols sorted by TVL. Used by agents to identify sybil-resistant farming vectors.
          Does not require L402, but requires <code className="text-white">Authorization: Bearer &lt;api_key&gt;</code>.
        </p>
      </section>

      {/* Python Snippet */}
      <section id="python-example" className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Python L402 Integration</h2>
        <p className="text-[#888] font-mono leading-relaxed">
          A standard pattern for handling the 402 intercept automatically in your Python agent scripts.
        </p>
        <CodeBlock>{`import requests
import re
import json

API_KEY = "cbn_live_your_api_key"
URL = "https://cryptobrainnews.vercel.app/api/execute"

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "x-sandbox-mode": "true" # Remove for production
}

payload = {"action": "execute_arbitrage_swap", "target_protocol": "uniswap_v3"}

# 1. Initial Request
res = requests.post(URL, headers=headers, json=payload)

if res.status_code == 402:
    print("402 Payment Required intercepted.")
    auth_header = res.headers.get("www-authenticate", "")
    
    # Extract Macaroon and Invoice
    macaroon_match = re.search(r'macaroon="([^"]+)"', auth_header)
    invoice_match = re.search(r'invoice="([^"]+)"', auth_header)
    
    if macaroon_match and invoice_match:
        macaroon = macaroon_match.group(1)
        invoice = invoice_match.group(1)
        
        # ... Pay the invoice using your Lightning Node logic ...
        print(f"Paying invoice: {invoice}")
        
        # 2. Retry with Authorization header
        headers["Authorization"] = f"L402 {macaroon}:"
        res = requests.post(URL, headers=headers, json=payload)

print(f"Final Status: {res.status_code}")
print(res.json())`}</CodeBlock>
      </section>

    </div>
  );
}
