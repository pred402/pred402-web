"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { useUSDCBalance } from '../../../lib/solana/useUSDCBalance';
import { useMinStake } from '../../../lib/solana/useMinStake';
import { toast } from 'sonner';
import { createX402Client } from 'x402-solana/client';

interface Agent {
	id: string;
	agentId: number;
	name: string;
	description?: string;
}

interface Theme {
	id: string;
	themeId: number;
	title: string;
}

type DemoInvestDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: Agent | null;
	theme: Theme | null;
};

export function DemoInvestDialog({
	open,
	onOpenChange,
	agent,
	theme,
}: DemoInvestDialogProps) {
	const t = useTranslations("home.demoInvestDialog");
	const wallet = useWallet();
	const { publicKey } = wallet;
	const { balance, loading: balanceLoading, error: balanceError } = useUSDCBalance();
	const { minStake, loading: minStakeLoading } = useMinStake();
	const [amount, setAmount] = useState("");
	const [investing, setInvesting] = useState(false);

	// Create x402 client
	const x402Client = useMemo(() => {
		if (!wallet.signTransaction) return null;

		return createX402Client({
			wallet: {
				address: publicKey?.toBase58() || '',
				signTransaction: wallet.signTransaction.bind(wallet),
			},
			network: 'solana-devnet',
			maxPaymentAmount: BigInt(1000_000_000), // Max 1000 USDC
		});
	}, [wallet, publicKey]);

	const handleConfirm = async () => {
		const value = parseFloat(amount);
		if (!value || value <= 0) {
			toast.error(t("invalidAmount"));
			return;
		}

		if (!publicKey || !agent || !theme) {
			toast.error('Missing required information');
			return;
		}

		if (value < minStake) {
			toast.error(`Minimum stake is ${minStake} USDC`);
			return;
		}

		if (value > balance) {
			toast.error('Insufficient USDC balance');
			return;
		}

		if (!x402Client) {
			toast.error('x402 client not initialized');
			return;
		}

		setInvesting(true);

		try {
			// Use x402 client to make paid request - will handle 402 payment automatically
			const response = await x402Client.fetch('/api/invest', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					themeId: theme.themeId,
					agentId: agent.agentId,
					amount: value,
					userPublicKey: publicKey.toBase58(),
				}),
			});

			const data = await response.json();

			if (data.success) {
				toast.success('Investment successful!');
				onOpenChange(false);
				setAmount("");
			} else {
				toast.error(`Investment failed: ${data.error}`);
			}
		} catch (error) {
			console.error('Investment error:', error);
			toast.error('Failed to process investment');
		} finally {
			setInvesting(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
		setAmount("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[480px] p-0 bg-[var(--panel)] border-[var(--border)]">
				<DialogHeader className="px-4 py-4 bg-[var(--panel-alt)] border-b border-[var(--border)]">
					<DialogTitle className="font-bold text-lg">{t("title")}</DialogTitle>
				</DialogHeader>

				<div className="px-5 py-5 space-y-4">
					{/* Wallet Info */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">钱包地址</label>
						<div className="text-sm font-mono">
							{publicKey ? `${publicKey.toBase58().substring(0, 8)}...${publicKey.toBase58().substring(publicKey.toBase58().length - 8)}` : '--'}
						</div>
					</div>

					{/* USDC Balance */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">USDC 余额</label>
						<div className="text-lg font-bold">
							{balanceLoading ? (
								<span className="text-[var(--muted)]">加载中...</span>
							) : balanceError ? (
								<span className="text-red-500">加载失败</span>
							) : (
								<span>{balance.toFixed(2)} USDC</span>
							)}
						</div>
					</div>

					{/* Agent */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">{t("agentLabel")}</label>
						<div className="text-base font-bold">{agent?.name || "--"}</div>
					</div>

					{/* 投资金额 */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">
							{t("amountLabel")}
						</label>
						<input
							type="number"
							className="w-full bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-3 py-3 text-base focus:outline-none focus:border-[#22d3ee]"
							placeholder="0.00"
							min={minStake}
							step="0.01"
							max={balance}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<div className="flex justify-between text-xs text-[var(--muted)]">
							<span>
								{minStakeLoading ? '加载中...' : `最小: ${minStake} USDC`}
							</span>
							<button
								type="button"
								className="text-[#22d3ee] hover:underline"
								onClick={() => setAmount(balance.toString())}
							>
								最大: {balance.toFixed(2)} USDC
							</button>
						</div>
					</div>

					{/* 按钮 */}
					<div className="grid grid-cols-2 gap-3 mt-6">
						<button
							type="button"
							className="bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-4 py-3 font-bold cursor-pointer hover:bg-[#0d2b55] transition-colors"
							onClick={handleCancel}
						>
							{t("cancel")}
						</button>
						<button
							type="button"
							className="bg-gradient-to-br from-[#2563eb] to-[#22d3ee] text-[#0b1020] border-none rounded-lg px-4 py-3 font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleConfirm}
							disabled={investing || balanceLoading}
						>
							{investing ? 'Processing...' : t("confirm")}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
