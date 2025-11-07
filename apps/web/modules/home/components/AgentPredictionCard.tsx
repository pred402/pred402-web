"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader } from "@ui/components/card";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { InvestDialog } from "./InvestDialog";
import { ReportDialog } from "./ReportDialog";

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
	agentId: string;
	eventId: string;
	reportDate: Date;
	headline?: string | null;
	summary?: string | null;
	rawOutput?: any;
	confidence?: number | null;
	agent: Agent;
	markets: Array<{
		id: number;
		probability: number;
		rationale?: string | null;
		market: Market;
	}>;
	stats: {
		totalInvestors: number;
		totalInvestmentAmount: number;
	};
};

type Event = {
	id: string;
	title: Record<string, string>;
};

type AgentPredictionCardProps = {
	report: AgentReport;
	event: Event;
};

export function AgentPredictionCard({ report, event }: AgentPredictionCardProps) {
	const t = useTranslations();
	const [showReportDialog, setShowReportDialog] = useState(false);
	const [showInvestDialog, setShowInvestDialog] = useState(false);

	const { agent, markets, stats, headline, summary, confidence } = report;

	// 按概率排序市场
	const sortedMarkets = [...markets].sort(
		(a, b) => Number(b.probability) - Number(a.probability),
	);

	// 获取agent名字的首字母作为头像fallback
	const avatarFallback = agent.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow">
				<CardHeader>
					<div className="flex items-start gap-4">
						<Avatar className="size-16">
							<AvatarImage
								src={agent.avatarUrl || undefined}
								alt={agent.name}
							/>
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<h3 className="text-xl font-bold mb-1">{agent.name}</h3>
							{agent.description && (
								<p className="text-sm text-muted-foreground">
									{agent.description}
								</p>
							)}
							{confidence && (
								<div className="mt-2">
									<Badge>
										{t("home.agent.confidence")}: {confidence}%
									</Badge>
								</div>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 预测市场列表 */}
					<div className="space-y-2">
						<h4 className="font-semibold text-sm">
							{t("home.agent.predictions")}
						</h4>
						<div className="space-y-2">
							{sortedMarkets.map((marketProb) => {
								const marketTitle =
									marketProb.market.title.zh ||
									marketProb.market.title.en ||
									"未知市场";
								return (
									<div
										key={marketProb.id}
										className="flex items-center justify-between text-sm"
									>
										<span className="text-muted-foreground">
											{marketTitle}
										</span>
										<Badge>
											{Number(marketProb.probability).toFixed(1)}%
										</Badge>
									</div>
								);
							})}
						</div>
					</div>

					{/* 研报摘要 */}
					{(headline || summary) && (
						<div className="space-y-2">
							<h4 className="font-semibold text-sm">
								{t("home.agent.reportSummary")}
							</h4>
							{headline && (
								<p className="text-sm font-medium">{headline}</p>
							)}
							{summary && (
								<p className="text-sm text-muted-foreground line-clamp-3">
									{summary}
								</p>
							)}
						</div>
					)}

					{/* 投资统计 */}
					<div className="space-y-2">
						<h4 className="font-semibold text-sm">
							{t("home.agent.investmentStats")}
						</h4>
						<div className="flex items-center gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">
									{t("home.agent.totalInvestors")}:{" "}
								</span>
								<span className="font-medium">
									{stats.totalInvestors}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground">
									{t("home.agent.totalAmount")}:{" "}
								</span>
								<span className="font-medium">
									{Number(stats.totalInvestmentAmount).toFixed(2)}{" "}
									USDC
								</span>
							</div>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setShowReportDialog(true)}
						>
							{t("home.agent.viewReport")}
						</Button>
						<Button
							className="flex-1"
							onClick={() => setShowInvestDialog(true)}
						>
							{t("home.agent.invest")}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* 研报详情对话框 */}
			<ReportDialog
				open={showReportDialog}
				onOpenChange={setShowReportDialog}
				report={report}
			/>

			{/* 跟投对话框 */}
			<InvestDialog
				open={showInvestDialog}
				onOpenChange={setShowInvestDialog}
				report={report}
				event={event}
			/>
		</>
	);
}
