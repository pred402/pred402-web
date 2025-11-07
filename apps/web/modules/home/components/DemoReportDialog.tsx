"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useState } from "react";

const reports = {
	DeepSeek: {
		"2025-11-04": {
			sources: [
				"民意调查（FiveThirtyEight 汇总）",
				"过往5年选举年财报公开数据",
				"历史选举投票率数据库",
			],
			methods: [
				"多元回归（投票率×筹款×事件冲击）",
				"趋势分析（7/14日滑动窗口）",
				"情感分析（中文与英文媒体语料融合）",
			],
			charts: [
				{ title: "关键州投票率趋势（5年）", type: "line" },
				{ title: "A/B/C/D/其他 话题热度占比", type: "bar" },
			],
			conclusion:
				"综合指标显示 A 在组织动员与地面拉票上具持续优势，短期波动不足以改变中期趋势。",
			recommend: "候选人 A",
		},
		"2025-11-05": {
			sources: ["民调周报", "新闻事件时间线", "志愿者活跃度日志"],
			methods: ["异常值剔除 + 加权回归", "情感分布校准（去极端）"],
			charts: [
				{ title: "民调中位数与置信区间", type: "line" },
				{ title: "社媒正负面情绪比分", type: "bar" },
			],
			conclusion: "民调中位数对 A/B 的差距保持在误差上沿，A 的领先更稳健。",
			recommend: "候选人 A",
		},
		"2025-11-06": {
			sources: ["竞选筹款明细（最新）", "KOL 帐号传播网络"],
			methods: ["网络中心度分析", "因子回归（资金×传播×地面）"],
			charts: [
				{ title: "筹款结构与增速", type: "bar" },
				{ title: "传播网络中心度", type: "line" },
			],
			conclusion: "A 的基层小额捐款占比与增速提升，显示组织韧性较强。",
			recommend: "候选人 A",
		},
	},
	Claude: {
		"2025-11-04": {
			sources: ["Polymarket 盘口", "社区讨论热度"],
			methods: ["盘口隐含概率拟合", "共识偏差识别"],
			charts: [
				{ title: "盘口隐含概率曲线", type: "line" },
				{ title: "多空留言比", type: "bar" },
			],
			conclusion: "盘口与讨论度一致看多 B。",
			recommend: "候选人 B",
		},
		"2025-11-05": {
			sources: ["盘口深度", "成交量"],
			methods: ["深度-成交共振判定"],
			charts: [
				{ title: "盘口深度对比", type: "bar" },
				{ title: "成交量时序", type: "line" },
			],
			conclusion: "买单挂墙显著，B 优势延续。",
			recommend: "候选人 B",
		},
		"2025-11-06": {
			sources: ["盘口资金流"],
			methods: ["资金净流入强度"],
			charts: [
				{ title: "净流强度", type: "line" },
				{ title: "挂单分布", type: "bar" },
			],
			conclusion: "短线回调但趋势未破。",
			recommend: "候选人 B",
		},
	},
	"Grok 4": {
		"2025-11-04": {
			sources: ["X 热度", "转推网络", "Space 摘要"],
			methods: ["扩散半径与爆点检测", "情绪阈值触发"],
			charts: [
				{ title: "话题扩散时序", type: "line" },
				{ title: "情绪强度分布", type: "bar" },
			],
			conclusion: "风向窗口指向 C，需跟踪反方声音。",
			recommend: "候选人 C",
		},
		"2025-11-05": {
			sources: ["热搜趋势", "KOL 传播路径"],
			methods: ["路径中心度", "反噪加权"],
			charts: [
				{ title: "KOL 中心度", type: "bar" },
				{ title: "热度峰值", type: "line" },
			],
			conclusion: "C 的讨论峰值延长，窗口仍在。",
			recommend: "候选人 C",
		},
		"2025-11-06": {
			sources: ["转推速率"],
			methods: ["半衰期拟合"],
			charts: [
				{ title: "传播半衰期", type: "line" },
				{ title: "正负面比", type: "bar" },
			],
			conclusion: "扩散速度略降但仍优于同组。",
			recommend: "候选人 C",
		},
	},
	Qwen: {
		"2025-11-04": {
			sources: ["知乎长评", "微博讨论串", "公众号文章"],
			methods: ["主题聚类", "证据链梳理"],
			charts: [
				{ title: "观点阵营占比", type: "bar" },
				{ title: "主题词趋势", type: "line" },
			],
			conclusion: "中文语域对 A 的政策细节更认可。",
			recommend: "候选人 A",
		},
		"2025-11-05": {
			sources: ["B站评论", "贴吧长帖"],
			methods: ["小样本深挖", "反例校验"],
			charts: [
				{ title: "长评好感度", type: "bar" },
				{ title: "反例密度", type: "line" },
			],
			conclusion: "A 的正反馈更稳定。",
			recommend: "候选人 A",
		},
		"2025-11-06": {
			sources: ["小红书笔记", "论坛精华帖"],
			methods: ["质量评分", "情绪纠偏"],
			charts: [
				{ title: "内容质量评分", type: "bar" },
				{ title: "情绪纠偏前后", type: "line" },
			],
			conclusion: "中文社群对 A 的信任延续。",
			recommend: "候选人 A",
		},
	},
	GPT: {
		"2025-11-04": {
			sources: ["跨源摘要", "事实核对"],
			methods: ["证据去重", "中位数立场"],
			charts: [
				{ title: "证据权重分布", type: "bar" },
				{ title: "不确定性区间", type: "line" },
			],
			conclusion: "A 与 B 差距处于误差上沿，建议分散。",
			recommend: "候选人 B",
		},
		"2025-11-05": {
			sources: ["对比表", "反证清单"],
			methods: ["反证强度评估"],
			charts: [
				{ title: "反证强度", type: "bar" },
				{ title: "概率区间", type: "line" },
			],
			conclusion: "短期 B 的确定性略强。",
			recommend: "候选人 B",
		},
		"2025-11-06": {
			sources: ["最新摘要", "一致性检查"],
			methods: ["一致性评分"],
			charts: [
				{ title: "一致性评分", type: "bar" },
				{ title: "敏感性分析", type: "line" },
			],
			conclusion: "维持对 B 的轻度倾向。",
			recommend: "候选人 B",
		},
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
	const agentReports = agent ? reports[agent as keyof typeof reports] : null;
	const dates = agentReports ? Object.keys(agentReports).sort() : [];
	const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1] || "");

	const data = agentReports && selectedDate ? agentReports[selectedDate as keyof typeof agentReports] : null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[860px] max-h-[80vh] overflow-hidden p-0 bg-[var(--panel)] border-[var(--border)]">
				<DialogHeader className="px-4 py-3 bg-[var(--panel-alt)] border-b border-[var(--border)]">
					<DialogTitle className="font-bold text-lg">
						{agent} · 日更研报
					</DialogTitle>
				</DialogHeader>

				<div className="px-4 py-4 overflow-auto bg-[var(--card)]">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-sm text-[var(--muted)]">选择日期：</span>
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
								<h4 className="font-semibold text-sm mb-2">1. 数据收集</h4>
								<ul className="list-disc list-inside text-sm text-[var(--muted)] space-y-1">
									{data.sources.map((s, i) => (
										<li key={i}>{s}</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">2. 分析方法</h4>
								<ul className="list-disc list-inside text-sm text-[var(--muted)] space-y-1">
									{data.methods.map((m, i) => (
										<li key={i}>{m}</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">3. 图表展示</h4>
								<div className="grid grid-cols-2 gap-3">
									{data.charts.map((c, i) => (
										<div
											key={i}
											className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3"
										>
											<h5 className="text-sm mb-2">{c.title}</h5>
											<div className="w-full h-40 bg-[#0b1b35] border border-[var(--border)] rounded-lg flex items-center justify-center">
												{renderChartSVG(c.type)}
											</div>
											<div className="text-xs text-[var(--muted)] mt-2">
												图表说明：关键指标可视化，仅作示意。
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">4. 结论</h4>
								<p className="text-sm">{data.conclusion}</p>
							</div>

							<div>
								<h4 className="font-semibold text-sm mb-2">5. 下注建议</h4>
								<p className="text-sm">
									推荐：
									<span className="inline-flex items-center gap-2 bg-[#0b2447] border border-[var(--border)] text-[#dbe7ff] rounded-full px-3 py-1 font-bold ml-2">
										{data.recommend}
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
