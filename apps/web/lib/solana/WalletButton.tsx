"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletIcon } from 'lucide-react';
import { Button } from '@ui/components/button';

export function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={publicKey ? "outline" : "primary"}
      size="sm"
      disabled={connecting}
    >
      <WalletIcon className="size-4 mr-2" />
      {connecting ? (
        "连接中..."
      ) : publicKey ? (
        <>
          {publicKey.toBase58().substring(0, 4)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
        </>
      ) : (
        "连接钱包"
      )}
    </Button>
  );
}
