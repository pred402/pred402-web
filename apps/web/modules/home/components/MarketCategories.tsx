"use client";

import { Badge } from "@ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";

type Market = {
	id: string;
	title: Record<string, string>;
};

type AgentReport = {
	agent: {
		name: string;
		slug: string;
	};
	markets: Array<{
		market: Market;
		probability: number;
	}>;
};

type Event = {
	id: string;
	title: Record<string, string>;
};

type MarketCategoriesProps = {
	event: Event;
	agentReports: AgentReport[];
};

export function MarketCategories({ event, agentReports }: MarketCategoriesProps) {
	// 聚合数据：每个市场对应支持它的 agents
	const marketAgentMap = new Map<string, { market: Market; agents: string[] }>();

	agentReports.forEach((report) => {
		// 找到该 agent 预测概率最高的市场
		if (report.markets && report.markets.length > 0) {
			const topMarket = report.markets.reduce((prev, current) => {
				return current.probability > prev.probability ? current : prev;
			});

			if (topMarket) {
				const marketId = topMarket.market.id;
				if (!marketAgentMap.has(marketId)) {
					marketAgentMap.set(marketId, {
						market: topMarket.market,
						agents: [],
					});
				}
				marketAgentMap.get(marketId)?.agents.push(report.agent.name);
			}
		}
	});

	// 如果没有数据，显示提示
	if (marketAgentMap.size === 0) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-muted-foreground text-sm">暂无候选人数据</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
			{Array.from(marketAgentMap.entries()).map(([marketId, data]) => {
				const marketTitle = data.market.title.zh || data.market.title.en || "未知市场";

				return (
					<Card key={marketId} className="hover:shadow-md transition-shadow">
						<CardHeader className="p-4 pb-2">
							<CardTitle className="text-sm font-semibold leading-tight">
								{marketTitle}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4 pt-2">
							{data.agents.length > 0 ? (
								<div className="flex flex-wrap gap-1.5">
									{data.agents.map((agentName, idx) => (
										<Badge
											key={idx}
											variant="secondary"
											className="text-xs px-2 py-0.5"
										>
											{agentName}
										</Badge>
									))}
								</div>
							) : (
								<span className="text-xs text-muted-foreground">暂无</span>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
