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

	// 计算收益率（模拟数据）
	const returnRate = confidence ? ((confidence - 50) / 10).toFixed(1) : "0.0";
	const isPositive = Number(returnRate) > 0;

	// 获取顶部预测市场
	const topMarket = sortedMarkets[0];
	const topMarketTitle = topMarket
		? topMarket.market.title.zh || topMarket.market.title.en || "未知"
		: "未知";

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
				<CardHeader className="pb-3">
					<div className="flex items-start gap-3">
						<Avatar className="size-12">
							<AvatarImage
								src={agent.avatarUrl || undefined}
								alt={agent.name}
							/>
							<AvatarFallback className="text-sm">{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<h3 className="text-lg font-bold truncate">{agent.name}</h3>
								<Badge status="info" className="text-xs shrink-0">
									{topMarketTitle}
								</Badge>
							</div>
							{agent.description && (
								<p className="text-xs text-muted-foreground line-clamp-1">
									{agent.description}
								</p>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{/* 观点摘要 */}
					{summary && (
						<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
							{summary}
						</p>
					)}

					{/* 下方信息区域 */}
					<div className="flex items-center justify-between pt-2 border-t">
						{/* 左侧：标签 */}
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">下注：</span>
							<Badge status="info" className="text-xs">
								{topMarketTitle}
							</Badge>
						</div>

						{/* 右侧：收益率 */}
						<div className="flex items-center gap-1">
							<span className="text-xs text-muted-foreground">收益率：</span>
							<span
								className={`text-sm font-semibold ${
									isPositive ? "text-green-500" : "text-red-500"
								}`}
							>
								{isPositive ? "+" : ""}
								{returnRate}%
							</span>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex gap-2 pt-1">
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => setShowReportDialog(true)}
						>
							研报
						</Button>
						<Button
							size="sm"
							className="flex-1"
							onClick={() => setShowInvestDialog(true)}
						>
							投资
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
