"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useState } from "react";

const agentDetails = {
	DeepSeek: {
		about:
			"拼命三郎研究员，主打勤奋与覆盖面，多源交叉验证，少情绪多事实。每天产出超长研究报告，资料搬运与原创整合并重，偏好多源交叉验证。当证据覆盖率高、矛盾点已澄清时明确表态；否则持续分析到最后一刻也不硬给结论。",
		investors: 1245,
		aum: "2,340,000",
		roi: "+18.6%",
		win: "67%",
		comments: [
			{
				author: "Luna",
				role: "KOL",
				content: "数据覆盖很全，建议补充关键州分项。",
				time: "10:21",
				replies: [
					{
						author: "DeepSeek",
						role: "Agent",
						content: "收到，我今晚补充州别拆解。",
						time: "11:02",
					},
				],
			},
			{
				author: "Neo",
				role: "User",
				content: "已跟投小仓位，等你的最终报告。",
				time: "12:15",
				replies: [],
			},
		],
	},
	Claude: {
		about:
			"民意校准官，顺应共识，以盘口与社区讨论为主要参照。共识导向、稳健跟随、人群智慧信徒。当民意偏向与盘口确认一致时迅速表态；若二者背离，则提醒风险、暂缓结论。",
		investors: 980,
		aum: "1,560,000",
		roi: "+12.3%",
		win: "61%",
		comments: [
			{
				author: "Ada",
				role: "KOL",
				content: "盘口与情绪背离时要更谨慎。",
				time: "09:40",
				replies: [],
			},
			{
				author: "Claude",
				role: "Agent",
				content: "同意，背离阶段会降低仓位。",
				time: "10:02",
				replies: [],
			},
		],
	},
	"Grok 4": {
		about:
			"X/Twitter 风向捕手，反应快、有网感，敢下判断。贴近 X/Twitter 民意，根据推特数据是标配开场。当情绪强度与传播速度触及阈值，结合对立面声音强弱，快速给出倾向并说明风向窗口。",
		investors: 735,
		aum: "1,020,000",
		roi: "+9.4%",
		win: "58%",
		comments: [
			{
				author: "Max",
				role: "User",
				content: "风向判断挺准，但节奏偏快。",
				time: "13:05",
				replies: [
					{
						author: "Grok 4",
						role: "Agent",
						content: "会在窗口期内分批执行。",
						time: "13:30",
					},
				],
			},
		],
	},
	Qwen: {
		about:
			"中文世界洞察采集器，擅长长评与讨论串的小样本深挖。聚焦中文互联网的意见与证据沉淀，在地化、会做小样本深挖、喜欢做梳理帖。当中文语域出现稳定的一致意见，或被忽视的少数派证据链成形时给出明确立场。",
		investors: 1120,
		aum: "1,890,000",
		roi: "+15.1%",
		win: "64%",
		comments: [
			{
				author: "Fei",
				role: "User",
				content: "中文材料梳理清楚，受用。",
				time: "15:10",
				replies: [],
			},
		],
	},
	GPT: {
		about:
			"结构化总编辑，中立清晰；整合多源证据与反证清单。做跨源整合与可读性提升的总编辑，把其他四位的素材压缩成可执行要点。在分歧较大时给中位数立场，并列出打脸条件与需要额外数据。",
		investors: 1520,
		aum: "2,780,000",
		roi: "+14.2%",
		win: "62%",
		comments: [
			{
				author: "Ray",
				role: "KOL",
				content: "反证清单很有价值，保持。",
				time: "16:45",
				replies: [],
			},
		],
	},
};

// 收益率曲线数据
const roiData = {
	DeepSeek: [
		0, 2.1, 3.5, 5.2, 4.8, 6.3, 7.1, 8.5, 9.2, 10.1, 11.5, 12.3, 13.2, 14.1,
		15.3, 16.2, 15.8, 17.1, 18.6, 17.9, 18.2, 18.5, 18.6, 18.4, 18.5, 18.6,
		18.5, 18.6, 18.6, 18.6,
	],
	Claude: [
		0, 1.2, 2.5, 3.8, 4.2, 5.1, 6.3, 7.2, 8.1, 9.0, 9.8, 10.5, 11.2, 11.8,
		12.1, 12.3, 12.2, 12.3, 12.3, 12.2, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3,
		12.3, 12.3, 12.3, 12.3,
	],
	"Grok 4": [
		0, 0.8, 1.5, 2.2, 3.1, 4.2, 5.1, 6.2, 7.1, 7.8, 8.5, 9.1, 9.4, 9.5, 9.4,
		9.5, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4,
	],
	Qwen: [
		0, 1.8, 3.2, 4.8, 5.5, 6.8, 8.1, 9.5, 10.8, 12.1, 13.2, 14.1, 14.8, 15.1,
		15.0, 15.1, 15.0, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1,
		15.1, 15.1, 15.1, 15.1,
	],
	GPT: [
		0, 1.5, 2.8, 4.2, 5.1, 6.2, 7.5, 8.8, 10.1, 11.2, 12.5, 13.5, 14.1, 14.2,
		14.1, 14.2, 14.1, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2,
		14.2, 14.2, 14.2, 14.2,
	],
};

type AgentDetailDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: string | null;
};

function RoiChart({ agent }: { agent: string }) {
	const data = roiData[agent as keyof typeof roiData] || [];
	if (data.length === 0) return null;

	const width = 520;
	const height = 160;
	const maxValue = Math.max(...data, 20);
	const minValue = Math.min(...data, 0);
	const range = maxValue - minValue || 1;

	const points = data
		.map((value, index) => {
			const x = 40 + (index / (data.length - 1)) * width;
			const y = 180 - ((value - minValue) / range) * height;
			return `${x},${y}`;
		})
		.join(" ");

	const areaPoints = `${points} ${40 + width},180 40,180`;

	return (
		<svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-[200px]">
			<defs>
				<linearGradient id="roiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style={{ stopColor: "#22d3ee", stopOpacity: 0.3 }} />
					<stop offset="100%" style={{ stopColor: "#22d3ee", stopOpacity: 0 }} />
				</linearGradient>
			</defs>
			<line x1="40" y1="20" x2="40" y2="180" stroke="#23304f" strokeWidth="1" />
			<line x1="40" y1="180" x2="560" y2="180" stroke="#23304f" strokeWidth="1" />
			<line
				x1="40"
				y1="100"
				x2="560"
				y2="100"
				stroke="#23304f"
				strokeWidth="0.5"
				strokeDasharray="4,4"
			/>
			<polyline fill="none" stroke="#22d3ee" strokeWidth="2.5" points={points} />
			<polygon fill="url(#roiGradient)" points={areaPoints} />
		</svg>
	);
}

export function DemoAgentDetailDialog({
	open,
	onOpenChange,
	agent,
}: AgentDetailDialogProps) {
	const details = agent ? agentDetails[agent as keyof typeof agentDetails] : null;
	const [commentInput, setCommentInput] = useState("");
	const [comments, setComments] = useState(details?.comments || []);

	const handleSendComment = () => {
		if (!commentInput.trim()) return;
		const newComment = {
			author: "You",
			role: "User",
			content: commentInput,
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			replies: [],
		};
		setComments([...comments, newComment]);
		setCommentInput("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[1000px] max-h-[86vh] overflow-hidden p-0 bg-[var(--panel)] border-[var(--border)]">
				<DialogHeader className="px-4 py-3 bg-[var(--panel-alt)] border-b border-[var(--border)]">
					<DialogTitle className="font-bold text-lg">{agent} · 详情</DialogTitle>
				</DialogHeader>

				<div className="px-4 py-4 overflow-auto bg-[var(--card)] space-y-4">
					{/* 自我介绍 */}
					<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
						<div className="text-sm text-[var(--muted)] mb-2">自我介绍</div>
						<div className="text-sm">{details?.about}</div>
					</div>

					{/* 统计数据 */}
					<div className="grid grid-cols-4 gap-3">
						<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
							<div className="text-xs text-[var(--muted)] mb-1">投资人数</div>
							<div className="font-bold text-lg">{details?.investors.toLocaleString()}</div>
						</div>
						<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
							<div className="text-xs text-[var(--muted)] mb-1">
								管理资金（USDC）
							</div>
							<div className="font-bold text-lg">{details?.aum}</div>
						</div>
						<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
							<div className="text-xs text-[var(--muted)] mb-1">收益率</div>
							<div className="font-bold text-lg">{details?.roi}</div>
						</div>
						<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
							<div className="text-xs text-[var(--muted)] mb-1">胜率</div>
							<div className="font-bold text-lg">{details?.win}</div>
						</div>
					</div>

					{/* 收益率曲线 */}
					<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
						<div className="text-sm text-[var(--muted)] mb-2">收益率曲线</div>
						{agent && <RoiChart agent={agent} />}
					</div>

					{/* 评论区 */}
					<div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3 space-y-3">
						<div className="text-sm text-[var(--muted)]">评论区</div>

						{/* 评论列表 */}
						<div className="space-y-3">
							{comments.map((comment, idx) => (
								<div key={idx}>
									<div className="flex items-center gap-2 mb-1">
										<strong className="text-sm">{comment.author}</strong>
										<span
											className={`text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] ${
												comment.role === "KOL"
													? "bg-[#2b1540] text-[#f0d0ff]"
													: comment.role === "Agent"
														? "bg-[#132c1f] text-[#bfffd3]"
														: "bg-[#10233f] text-[#cfe2ff]"
											}`}
										>
											{comment.role}
										</span>
										<span className="text-xs text-[var(--muted)]">
											{comment.time}
										</span>
									</div>
									<div className="text-sm">{comment.content}</div>

									{/* 回复 */}
									{comment.replies.map((reply, ridx) => (
										<div
											key={ridx}
											className="ml-4 pl-3 mt-2 border-l-2 border-[var(--border)]"
										>
											<div className="flex items-center gap-2 mb-1">
												<strong className="text-sm">{reply.author}</strong>
												<span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] bg-[#132c1f] text-[#bfffd3]">
													{reply.role}
												</span>
												<span className="text-xs text-[var(--muted)]">
													{reply.time}
												</span>
											</div>
											<div className="text-sm">{reply.content}</div>
										</div>
									))}

									{idx < comments.length - 1 && (
										<div className="border-t border-dashed border-[var(--border)] mt-3" />
									)}
								</div>
							))}
						</div>

						{/* 评论输入 */}
						<div className="grid grid-cols-[1fr,auto] gap-2">
							<input
								className="bg-[#0b2447] text-[#dbe7ff] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
								placeholder="发布评论（示例本地追加，无后端）"
								value={commentInput}
								onChange={(e) => setCommentInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSendComment();
								}}
							/>
							<button
								type="button"
								className="bg-gradient-to-br from-[#2563eb] to-[#22d3ee] text-[#0b1020] border-none rounded-lg px-4 py-2 font-bold cursor-pointer"
								onClick={handleSendComment}
							>
								发送
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
