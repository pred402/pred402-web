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

	// 定义颜色方案
	const colors = [
		"bg-blue-500",
		"bg-orange-500",
		"bg-green-500",
		"bg-pink-500",
		"bg-purple-500",
	];

	return (
		<Card className="sticky top-6">
			<CardHeader>
				<CardTitle>下注分布</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{sortedMarkets.map(({ id, market, avgProbability }, index) => {
						const marketTitle =
							market.title.zh || market.title.en || "未知市场";
						const color = colors[index % colors.length];

						return (
							<div key={id} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${color}`} />
										<span className="font-medium text-sm">
											{marketTitle}
										</span>
									</div>
									<span className="font-semibold text-sm">
										{avgProbability.toFixed(0)}%
									</span>
								</div>
								<div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
									<div
										className={`absolute left-0 top-0 h-full ${color} transition-all duration-300`}
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
