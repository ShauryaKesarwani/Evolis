"use client";

import { useConnect } from 'wagmi';
import { X, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connectors: allConnectors, connect, isSuccess, error } = useConnect();
  const [mounted, setMounted] = useState(false);

  // Deduplicate connectors by name (wagmi auto-detects injected wallets,
  // which can duplicate the explicitly configured MetaMask connector)
  const connectors = allConnectors.filter(
    (connector, index, self) =>
      self.findIndex((c) => c.name === connector.name) === index
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/60 backdrop-blur-sm transition-all duration-300 px-4">
      <div className="bg-[#FCFAF6] border-2 border-[#111111] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] rounded-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-transform relative">
        <div className="flex justify-between items-center p-5 border-b-2 border-[#111111] bg-white">
          <h2 className="text-xl font-bold font-mono text-[#111111] flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#111111]/5 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-[#111111]" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="w-full py-3 px-4 flex items-center justify-between border-2 border-[#111111] rounded-lg hover:bg-accent transition-colors group font-mono font-medium"
            >
              <span>{connector.name}</span>
              <div className="w-2 h-2 rounded-full bg-[#111111] group-hover:scale-150 transition-transform" />
            </button>
          ))}
          
          {error && (
            <div className="mt-2 text-red-500 text-sm font-medium font-sans px-2 py-1 bg-red-50 border border-red-200 rounded">
              {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
