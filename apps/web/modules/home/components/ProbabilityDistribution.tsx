"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useTranslations } from "next-intl";

type Market = {
	id: string;
	title: Record<string, string>;
};

type AgentReportWithProbabilities = {
	agent: {
		name: string;
		slug: string;
	};
	markets: Array<{
		probability: number;
		market: Market;
	}>;
};

type Event = {
	id: string;
	title: Record<string, string>;
};

type ProbabilityDistributionProps = {
	event: Event;
	agentReports: AgentReportWithProbabilities[];
};

export function ProbabilityDistribution({
	event,
	agentReports,
}: ProbabilityDistributionProps) {
	const t = useTranslations();

	// 聚合所有 agent 对每个 market 的概率
	const marketProbabilities = new Map<
		string,
		{ market: Market; probabilities: number[] }
	>();

	agentReports.forEach((report) => {
		report.markets.forEach(({ market, probability }) => {
			if (!marketProbabilities.has(market.id)) {
				marketProbabilities.set(market.id, {
					market,
					probabilities: [],
				});
			}
			marketProbabilities
				.get(market.id)
				?.probabilities.push(Number(probability));
		});
	});

	// 计算平均概率并排序
	const sortedMarkets = Array.from(marketProbabilities.entries())
		.map(([id, data]) => {
			const avgProbability =
				data.probabilities.reduce((a, b) => a + b, 0) /
				data.probabilities.length;
			return {
				id,
				market: data.market,
				avgProbability,
			};
		})
		.sort((a, b) => b.avgProbability - a.avgProbability);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("home.probabilityDistribution.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{sortedMarkets.map(({ id, market, avgProbability }) => {
						const marketTitle =
							market.title.zh || market.title.en || "未知市场";
						return (
							<div key={id} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">
										{marketTitle}
									</span>
									<span className="text-muted-foreground">
										{avgProbability.toFixed(1)}%
									</span>
								</div>
								<div className="h-2 bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all"
										style={{
											width: `${avgProbability}%`,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
