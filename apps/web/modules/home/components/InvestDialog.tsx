"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Market = {
	id: string;
	title: Record<string, string>;
};

type Agent = {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	avatarUrl?: string | null;
};

type AgentReport = {
	id: string;
	agent: Agent;
	markets: Array<{
		id: number;
		probability: number;
		rationale?: string | null;
		market: Market;
	}>;
};

type Event = {
	id: string;
	title: Record<string, string>;
};

type InvestDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: AgentReport;
	event: Event;
};

export function InvestDialog({
	open,
	onOpenChange,
	report,
	event,
}: InvestDialogProps) {
	const t = useTranslations();
	const [amount, setAmount] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { agent, markets } = report;

	// 获取概率最高的市场作为默认选择
	const defaultMarket = markets.reduce((prev, current) =>
		Number(prev.probability) > Number(current.probability) ? prev : current,
	);

	const handleInvest = async () => {
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			toast.error(t("home.investDialog.invalidAmount"));
			return;
		}

		setIsSubmitting(true);
		try {
			// TODO: 实现实际的跟投 API 调用
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success(t("home.investDialog.success"));
			onOpenChange(false);
			setAmount("");
		} catch (error) {
			toast.error(t("home.investDialog.error"));
		} finally {
			setIsSubmitting(false);
		}
	};

	const sortedMarkets = [...markets].sort(
		(a, b) => Number(b.probability) - Number(a.probability),
	);

	const avatarFallback = agent.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("home.investDialog.title")}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Agent 信息 */}
					<div className="flex items-center gap-3">
						<Avatar className="size-12">
							<AvatarImage
								src={agent.avatarUrl || undefined}
								alt={agent.name}
							/>
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<h3 className="font-bold">{agent.name}</h3>
							<p className="text-sm text-muted-foreground">
								{t("home.investDialog.followAgent")}
							</p>
						</div>
					</div>

					{/* 投资金额 */}
					<div className="space-y-2">
						<Label htmlFor="amount">
							{t("home.investDialog.amount")}
						</Label>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="0"
								step="0.01"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
								USDC
							</div>
						</div>
					</div>

					{/* 预测市场列表 */}
					<div className="space-y-2">
						<Label>{t("home.investDialog.selectMarket")}</Label>
						<div className="space-y-2">
							{sortedMarkets.map((marketProb) => {
								const marketTitle =
									marketProb.market.title.zh ||
									marketProb.market.title.en ||
									"未知市场";
								return (
									<div
										key={marketProb.id}
										className={`border rounded-lg p-3 ${
											defaultMarket.id === marketProb.id
												? "border-primary"
												: "border-muted"
										}`}
									>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												{marketTitle}
											</span>
											<Badge
												status={
													defaultMarket.id ===
													marketProb.id
														? "success"
														: "info"
												}
											>
												{Number(
													marketProb.probability,
												).toFixed(1)}
												%
											</Badge>
										</div>
										{marketProb.rationale && (
											<p className="text-xs text-muted-foreground mt-2 line-clamp-2">
												{marketProb.rationale}
											</p>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* 预期收益 */}
					<div className="bg-muted/50 p-4 rounded-lg space-y-2">
						<h4 className="font-semibold text-sm">
							{t("home.investDialog.expectedReturn")}
						</h4>
						<div className="text-sm text-muted-foreground space-y-1">
							<p>
								{t("home.investDialog.estimatedRoi")}:{" "}
								{defaultMarket.probability}%
							</p>
							{Number(amount) > 0 && (
								<p>
									{t("home.investDialog.estimatedPnl")}:{" "}
									{(
										Number(amount) *
										(Number(defaultMarket.probability) / 100)
									).toFixed(2)}{" "}
									USDC
								</p>
							)}
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => onOpenChange(false)}
						>
							{t("home.investDialog.cancel")}
						</Button>
						<Button
							className="flex-1"
							onClick={handleInvest}
							loading={isSubmitting}
						>
							{t("home.investDialog.confirm")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
