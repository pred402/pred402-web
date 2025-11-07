"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useState } from "react";

type DemoInvestDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: string | null;
};

export function DemoInvestDialog({
	open,
	onOpenChange,
	agent,
}: DemoInvestDialogProps) {
	const [amount, setAmount] = useState("");

	const handleConfirm = () => {
		const value = parseFloat(amount);
		if (!value || value <= 0) {
			alert("请输入有效的投资金额");
			return;
		}
		alert(`确认投资 ${value} USDT 到 ${agent}`);
		onOpenChange(false);
		setAmount("");
	};

	const handleCancel = () => {
		onOpenChange(false);
		setAmount("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[480px] p-0 bg-[var(--panel)] border-[var(--border)]">
				<DialogHeader className="px-4 py-4 bg-[var(--panel-alt)] border-b border-[var(--border)]">
					<DialogTitle className="font-bold text-lg">投资</DialogTitle>
				</DialogHeader>

				<div className="px-5 py-5 space-y-4">
					{/* Agent */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">Agent</label>
						<div className="text-base font-bold">{agent || "--"}</div>
					</div>

					{/* 投资金额 */}
					<div className="space-y-2">
						<label className="text-sm text-[var(--muted)]">
							投资金额（USDT）
						</label>
						<input
							type="number"
							className="w-full bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-3 py-3 text-base focus:outline-none focus:border-[#22d3ee]"
							placeholder="0.00"
							min="0"
							step="0.01"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
					</div>

					{/* 按钮 */}
					<div className="grid grid-cols-2 gap-3 mt-6">
						<button
							type="button"
							className="bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-4 py-3 font-bold cursor-pointer hover:bg-[#0d2b55] transition-colors"
							onClick={handleCancel}
						>
							取消
						</button>
						<button
							type="button"
							className="bg-gradient-to-br from-[#2563eb] to-[#22d3ee] text-[#0b1020] border-none rounded-lg px-4 py-3 font-bold cursor-pointer hover:opacity-90 transition-opacity"
							onClick={handleConfirm}
						>
							确认投资
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
