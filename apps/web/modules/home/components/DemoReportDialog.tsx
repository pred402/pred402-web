"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";

// 只保留日期和图表类型的结构，内容从翻译文件读取
const reportDates = {
	DeepSeek: ["2025-11-04", "2025-11-05", "2025-11-06"],
	Claude: ["2025-11-04", "2025-11-05", "2025-11-06"],
	"Grok 4": ["2025-11-04", "2025-11-05", "2025-11-06"],
	Qwen: ["2025-11-04", "2025-11-05", "2025-11-06"],
	GPT: ["2025-11-04", "2025-11-05", "2025-11-06"],
};

const chartTypes = {
	DeepSeek: {
		"2025-11-04": ["line", "bar"],
		"2025-11-05": ["line", "bar"],
		"2025-11-06": ["bar", "line"],
	},
	Claude: {
		"2025-11-04": ["line", "bar"],
		"2025-11-05": ["bar", "line"],
		"2025-11-06": ["line", "bar"],
	},
	"Grok 4": {
		"2025-11-04": ["line", "bar"],
		"2025-11-05": ["bar", "line"],
		"2025-11-06": ["line", "bar"],
	},
	Qwen: {
		"2025-11-04": ["bar", "line"],
		"2025-11-05": ["bar", "line"],
		"2025-11-06": ["bar", "line"],
	},
	GPT: {
		"2025-11-04": ["bar", "line"],
		"2025-11-05": ["bar", "line"],
		"2025-11-06": ["bar", "line"],
	},
};

type ReportDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: string | null;
};

function renderChartSVG(type: string) {
	if (type === "bar") {
		return (
			<svg width="100%" height="100%" viewBox="0 0 300 140" preserveAspectRatio="none">
				<rect x="20" y="100" width="30" height="20" fill="#60a5fa" />
				<rect x="70" y="80" width="30" height="40" fill="#f59e0b" />
				<rect x="120" y="60" width="30" height="60" fill="#34d399" />
				<rect x="170" y="90" width="30" height="30" fill="#f472b6" />
				<rect x="220" y="110" width="30" height="20" fill="#a78bfa" />
			</svg>
		);
	}
	// line
	return (
		<svg width="100%" height="100%" viewBox="0 0 300 140" preserveAspectRatio="none">
			<polyline
				fill="none"
				stroke="#22d3ee"
				strokeWidth="2"
				points="10,120 60,100 110,90 160,70 210,60 260,50"
			/>
			<polyline
				fill="none"
				stroke="#6ea8fe"
				strokeWidth="2"
				points="10,110 60,90 110,80 160,75 210,70 260,65"
			/>
		</svg>
	);
}

export function DemoReportDialog({ open, onOpenChange, agent }: ReportDialogProps) {
	const t = useTranslations("home.reportDialog");
	const dates = agent ? reportDates[agent as keyof typeof reportDates] || [] : [];
	const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1] || "");

	// 从翻译文件读取报告数据
	const getReportData = () => {
		if (!agent || !selectedDate) return null;

		const reportKey = `reports.${agent}.${selectedDate}`;
		try {
			return {
				sources: t.raw(`${reportKey}.sources`) as string[],
				methods: t.raw(`${reportKey}.methods`) as string[],
				charts: t.raw(`${reportKey}.charts`) as Array<{ title: string }>,
				conclusion: t(`${reportKey}.conclusion`),
				recommend: t(`${reportKey}.recommend`),
			};
		} catch (e) {
			return null;
		}
	};

	const data = getReportData();
	const types = agent && selectedDate
		? chartTypes[agent as keyof typeof chartTypes]?.[selectedDate as keyof (typeof chartTypes)["DeepSeek"]] || []
		: [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[860px] max-h-[80vh] overflow-hidden p-0 bg-[var(--panel)] border-[var(--border)]">
				<DialogHeader className="px-4 py-3 bg-[var(--panel-alt)] border-b border-[var(--border)]">
					<DialogTitle className="font-bold text-lg">
						{t("title", { agent: agent || "" })}
					</DialogTitle>
				</DialogHeader>

				<div className="px-4 py-4 overflow-auto bg-[var(--card)]">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-sm text-[var(--muted)]">{t("selectDate")}</span>
						<select
							className="bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
						>
							{dates.map((d) => (
								<option key={d} value={d}>
									{d}
								</option>
							))}
						</select>
					</div>

					{data && (
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold text-sm mb-2">{t("sections.dataCollection")}</h4>
								<ul className="list-disc list-inside text-sm text-[var(--muted)] space-y-1">
									{data.sources.map((s, i) => (
										<li key={i}>{s}</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">{t("sections.analysisMethods")}</h4>
								<ul className="list-disc list-inside text-sm text-[var(--muted)] space-y-1">
									{data.methods.map((m, i) => (
										<li key={i}>{m}</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">{t("sections.charts")}</h4>
								<div className="grid grid-cols-2 gap-3">
									{data.charts.map((c, i) => (
										<div
											key={i}
											className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3"
										>
											<h5 className="text-sm mb-2">{c.title}</h5>
											<div className="w-full h-40 bg-[#0b1b35] border border-[var(--border)] rounded-lg flex items-center justify-center">
												{renderChartSVG(types[i] || "line")}
											</div>
											<div className="text-xs text-[var(--muted)] mt-2">
												{t("chartCaption")}
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">{t("sections.conclusion")}</h4>
								<p className="text-sm">{data.conclusion}</p>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">{t("sections.recommendation")}</h4>
								<p className="text-sm">
									{t("recommend")}
									<span className="inline-flex items-center gap-2 bg-[#0b2447] border border-[var(--border)] text-[#dbe7ff] rounded-full px-3 py-1 font-bold ml-2">
										{t("candidate", { name: data.recommend })}
									</span>
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
