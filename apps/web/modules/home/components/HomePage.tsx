"use client";

import { useHomeLatestEventQuery } from "@home/lib/api";
import { Spinner } from "@shared/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useTranslations } from "next-intl";
import { AgentPredictionCard } from "./AgentPredictionCard";
import { EventHeader } from "./EventHeader";
import { ProbabilityDistribution } from "./ProbabilityDistribution";

export function HomePage() {
	const t = useTranslations();
	const { data, isLoading } = useHomeLatestEventQuery();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (!data?.event) {
		return (
			<div className="container mx-auto px-4 py-12">
				<Card>
					<CardHeader>
						<CardTitle>暂无事件</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							当前没有可用的预测事件，请稍后再试。
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const { event, agentReports } = data;

	// 处理数据转换
	const processedEvent = {
		...event,
		plannedEndAt: event.plannedEndAt ? new Date(event.plannedEndAt) : null,
	};

	const processedAgentReports = agentReports.map((report: any) => ({
		...report,
		reportDate: new Date(report.reportDate),
		markets: report.markets.map((market: any) => ({
			...market,
			probability: Number(market.probability),
		})),
		stats: {
			...report.stats,
			totalInvestmentAmount: Number(report.stats.totalInvestmentAmount),
		},
	}));

	return (
		<div className="container mx-auto px-4 py-12 space-y-8">
			{/* 事件标题和信息 */}
			<EventHeader event={processedEvent} />

			{/* 概率分布图 */}
			<ProbabilityDistribution
				event={processedEvent}
				agentReports={processedAgentReports}
			/>

			{/* Agent 预测卡片 */}
			<div className="space-y-4">
				<h2 className="text-2xl font-bold">
					{t("home.agentPredictions.title")}
				</h2>
				<div className="grid gap-6 lg:grid-cols-2">
					{processedAgentReports.map((report) => (
						<AgentPredictionCard
							key={report.id}
							report={report}
							event={processedEvent}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
