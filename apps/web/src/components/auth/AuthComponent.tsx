import React from 'react';
import Button from '../button';
import { useWallet } from '@solana/wallet-adapter-react';

function AuthComponent() {
  const { publicKey, connect, disconnect } = useWallet();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Potato Squeezy</h1>
        <Button 
          onClick={publicKey ? disconnect : connect}
          variant="default"
          className="min-w-[200px]"
        >
          {publicKey ? 'Disconnect Wallet' : 'Connect Wallet'}
        </Button>
      </div>
    </div>
  );
}

export default AuthComponent;