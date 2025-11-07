"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import { Badge } from "@ui/components/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useTranslations } from "next-intl";

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
};

type ReportDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: AgentReport;
};

export function ReportDialog({
	open,
	onOpenChange,
	report,
}: ReportDialogProps) {
	const t = useTranslations();

	const { agent, markets, headline, summary, confidence, reportDate } =
		report;

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
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("home.reportDialog.title")}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Agent 信息 */}
					<div className="flex items-start gap-4">
						<Avatar className="size-16">
							<AvatarImage
								src={agent.avatarUrl || undefined}
								alt={agent.name}
							/>
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<h3 className="text-xl font-bold">{agent.name}</h3>
							{agent.description && (
								<p className="text-sm text-muted-foreground mt-1">
									{agent.description}
								</p>
							)}
							<div className="flex items-center gap-2 mt-2">
								{confidence && (
									<Badge>
										{t("home.agent.confidence")}: {confidence}%
									</Badge>
								)}
								<Badge>
									{new Date(reportDate).toLocaleDateString()}
								</Badge>
							</div>
						</div>
					</div>

					{/* 研报标题 */}
					{headline && (
						<div>
							<h4 className="font-semibold mb-2">
								{t("home.reportDialog.headline")}
							</h4>
							<p className="text-lg font-medium">{headline}</p>
						</div>
					)}

					{/* 研报摘要 */}
					{summary && (
						<div>
							<h4 className="font-semibold mb-2">
								{t("home.reportDialog.summary")}
							</h4>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{summary}
							</p>
						</div>
					)}

					{/* 市场预测详情 */}
					<div>
						<h4 className="font-semibold mb-3">
							{t("home.reportDialog.predictions")}
						</h4>
						<div className="space-y-4">
							{sortedMarkets.map((marketProb) => {
								const marketTitle =
									marketProb.market.title.zh ||
									marketProb.market.title.en ||
									"未知市场";
								return (
									<div
										key={marketProb.id}
										className="border rounded-lg p-4 space-y-2"
									>
										<div className="flex items-center justify-between">
											<h5 className="font-medium">
												{marketTitle}
											</h5>
											<Badge>
												{Number(
													marketProb.probability,
												).toFixed(1)}
												%
											</Badge>
										</div>
										{marketProb.rationale && (
											<p className="text-sm text-muted-foreground">
												{marketProb.rationale}
											</p>
										)}
										<div className="h-2 bg-secondary rounded-full overflow-hidden">
											<div
												className="h-full bg-primary transition-all"
												style={{
													width: `${marketProb.probability}%`,
												}}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* 原始输出（如果有） */}
					{report.rawOutput && (
						<div>
							<h4 className="font-semibold mb-2">
								{t("home.reportDialog.rawOutput")}
							</h4>
							<div className="bg-muted p-4 rounded-lg overflow-x-auto">
								<pre className="text-xs">
									{JSON.stringify(report.rawOutput, null, 2)}
								</pre>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
