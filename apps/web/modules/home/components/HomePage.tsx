"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DemoAgentDetailDialog } from "./DemoAgentDetailDialog";
import { DemoInvestDialog } from "./DemoInvestDialog";
import { DemoReportDialog } from "./DemoReportDialog";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface ThemeOption {
	optionIndex: number;
	label: string;
	labelUri: string;
}

interface Theme {
	id: string;
	themeId: number;
	themePda: string;
	title: string;
	description?: string;
	metadataUri: string;
	endTime: string;
	resolutionTime: string;
	totalOptions: number;
	status: string;
	options: ThemeOption[];
}

interface Agent {
	id: string;
	agentId: number;
	agentPda: string;
	slug: string;
	name: string;
	description?: string;
	avatarUrl?: string;
}

export function HomePage() {
	const t = useTranslations("home");
	const { publicKey } = useWallet();
	const { setVisible: setWalletModalVisible } = useWalletModal();

	// Data state
	const [theme, setTheme] = useState<Theme | null>(null);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);

	// 倒计时状态
	const [eventTimeLeft, setEventTimeLeft] = useState(0);
	const [followTimeLeft, setFollowTimeLeft] = useState(0);

	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const [reportAgent, setReportAgent] = useState<string | null>(null);

	const [agentDetailDialogOpen, setAgentDetailDialogOpen] = useState(false);
	const [detailAgent, setDetailAgent] = useState<string | null>(null);

	const [investDialogOpen, setInvestDialogOpen] = useState(false);
	const [investAgent, setInvestAgent] = useState<Agent | null>(null);

	// Fetch data
	useEffect(() => {
		async function fetchData() {
			try {
				const [themesRes, agentsRes] = await Promise.all([
					fetch('/api/themes'),
					fetch('/api/agents'),
				]);

				const themesData = await themesRes.json();
				const agentsData = await agentsRes.json();

				if (themesData.success && themesData.data.length > 0) {
					// Get the first active theme
					const activeTheme = themesData.data[0];
					setTheme(activeTheme);

					// Calculate initial countdown values
					const now = Date.now();
					const endTime = new Date(activeTheme.endTime).getTime();
					const resolutionTime = new Date(activeTheme.resolutionTime).getTime();

					setFollowTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
					setEventTimeLeft(Math.max(0, Math.floor((resolutionTime - now) / 1000)));
				}

				if (agentsData.success) {
					setAgents(agentsData.data);
				}
			} catch (error) {
				console.error('Failed to fetch data:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// 倒计时逻辑
	useEffect(() => {
		const timer = setInterval(() => {
			setEventTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
			setFollowTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// 格式化倒计时显示 - 返回时间对象
	const getTimeComponents = (seconds: number) => {
		const days = Math.floor(seconds / (24 * 60 * 60));
		const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
		const minutes = Math.floor((seconds % (60 * 60)) / 60);
		const secs = seconds % 60;

		return { days, hours, minutes, secs };
	};

	const handleOpenReport = (agent: string) => {
		setReportAgent(agent);
		setReportDialogOpen(true);
	};

	const handleOpenAgentDetail = (agent: string) => {
		setDetailAgent(agent);
		setAgentDetailDialogOpen(true);
	};

	const handleOpenInvest = (agent: Agent) => {
		// Check if wallet is connected
		if (!publicKey) {
			// Show wallet connection modal
			setWalletModalVisible(true);
			return;
		}

		// Wallet is connected, open invest dialog
		setInvestAgent(agent);
		setInvestDialogOpen(true);
	};

	return (
		<>
			<style jsx global>{`
				:root {
					--bg: #0b1020;
					--panel: #121a2e;
					--panel-alt: #0f1730;
					--text: #e6e9f0;
					--muted: #aab2c8;
					--brand: #6ea8fe;
					--accent: #22d3ee;
					--success: #22c55e;
					--warning: #f59e0b;
					--danger: #ef4444;
					--card: #0e1527;
					--border: #23304f;
					--chip-bg: #0b2447;
				}

				body {
					background: radial-gradient(1200px 600px at 10% 0%, #0d1530 0%, var(--bg) 50%),
											radial-gradient(900px 500px at 90% 10%, #0b1b35 0%, var(--bg) 60%);
					color: var(--text);
				}

				.demo-container {
					height: calc(100vh - 56px);
					display: grid;
					grid-template-rows: auto 0.33fr 0.67fr;
					gap: 10px;
					padding: 4px clamp(14px, 3vw, 24px) 10px;
					overflow: hidden;
				}

				.countdown-section {
					display: flex;
					gap: 88px;
					justify-content: center;
					align-items: center;
					padding: 8px;
					border-radius: 16px;
				}

				.countdown-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 12px;
				}

				.countdown-label {
					font-size: 13px;
					font-weight: 600;
					letter-spacing: 0.5px;
					text-transform: uppercase;
				}

				.countdown-time {
					display: flex;
					gap: 8px;
					align-items: center;
				}

				.countdown-digits {
					display: flex;
					gap: 4px;
				}

				.flip-card {
					position: relative;
					width: 40px;
					height: 52px;
					perspective: 1000px;
				}

				.flip-card-inner {
					width: 100%;
					height: 100%;
					background: linear-gradient(180deg, #1a2847 0%, #0f1a35 100%);
					border: 1px solid var(--border);
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 28px;
					font-weight: 700;
					position: relative;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
				}

				// .flip-card-inner::before {
				// 	content: '';
				// 	position: absolute;
				// 	top: 50%;
				// 	left: 0;
				// 	right: 0;
				// 	height: 1px;
				// 	background: rgba(0, 0, 0, 0.4);
				// }

				// .flip-card-inner::after {
				// 	content: '';
				// 	position: absolute;
				// 	top: 50%;
				// 	left: 0;
				// 	right: 0;
				// 	height: 1px;
				// 	background: var(--border);
				// 	transform: translateY(-1px);
				// }

				.time-separator {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 2px;
					padding: 0 8px;
				}

				.time-separator-label {
					font-size: 14px;
					color: var(--muted);
					font-weight: 500;
					line-height: 1.2;
					white-space: nowrap;
				}

				.demo-market {
					border: 1px solid var(--border);
					border-radius: 16px;
					background: linear-gradient(180deg, var(--panel) 0%, var(--panel-alt) 100%);
					padding: clamp(6px, 1vw, 10px) clamp(10px, 1.6vw, 16px) clamp(10px, 1.6vw, 16px);
					display: flex;
					flex-direction: column;
					overflow: hidden;
					min-height: 0;
				}

				.demo-market-desc {
					color: var(--muted);
					margin-top: 0;
					font-size: 12px;
					line-height: 1.4;
				}

				.demo-market-body {
					display: grid;
					grid-template-columns: 2fr 3fr;
					gap: 12px;
					padding-top: 0;
					min-height: 0;
					flex: 1;
					align-items: stretch;
				}

				.demo-left-col {
					display: flex;
					flex-direction: column;
					gap: 1px;
					min-height: 0;
					overflow: hidden;
				}

				.demo-options {
					display: grid;
					grid-template-columns: repeat(5, minmax(0, 1fr));
					gap: 8px;
					grid-auto-rows: min-content;
					flex-shrink: 0;
					margin-top: auto;
				}

				.demo-option-card {
					background: var(--card);
					border: 1px solid var(--border);
					border-radius: 14px;
					padding: 4px 12px;
					display: flex;
					flex-direction: column;
					gap: 4px;
					position: relative;
					overflow: hidden;
				}

				.demo-option-name {
					font-weight: 700;
					font-size: 14px;
				}

				.demo-badge {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 4px 8px;
					border-radius: 999px;
					background: var(--chip-bg);
					border: 1px solid var(--border);
					color: var(--muted);
					font-size: 12px;
					white-space: nowrap;
				}

				.demo-agent-tags {
					display: flex;
					flex-wrap: nowrap;
					gap: 6px;
					overflow: hidden;
				}

				.demo-legend {
					background: var(--card);
					border: 1px solid var(--border);
					border-radius: 14px;
					padding: 12px 20px 12px 20px;
					display: grid;
					grid-template-rows: auto 1fr;
					gap: 6px;
					min-height: 0;
					overflow: hidden;
					align-self: start;
					height: 100%;
				}

				.demo-agent-predictions {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
					gap: 16px;
					flex: 1;
					min-height: 0;
				}

				.demo-agent-prediction {
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				.demo-prediction-chart {
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				.demo-agent-prediction-name {
					text-align: center;
					font-weight: 600;
					font-size: 12px;
					color: var(--muted);
					padding-top: 4px;
					border-top: 1px solid var(--border);
				}

				.demo-bar {
					display: grid;
					grid-template-columns: 50px 1fr 25px;
					align-items: center;
					gap: 4px;
					font-size: 12px;
				}

				.demo-bar-label {
					color: var(--muted);
					font-size: 12px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.demo-bar-track {
					position: relative;
					height: 14px;
					background: #0b2447;
					border: 1px solid var(--border);
					border-radius: 999px;
					overflow: hidden;
				}

				.demo-bar-fill {
					height: 100%;
					border-radius: 999px;
				}

				.demo-cA { background: #60a5fa; }
				.demo-cB { background: #f59e0b; }
				.demo-cC { background: #34d399; }
				.demo-cD { background: #f472b6; }
				.demo-cE { background: #a78bfa; }

				.demo-bar-val {
					text-align: right;
					color: var(--muted);
					font-size: 12px;
				}

				.demo-bar-agents {
					position: absolute;
					left: 8px;
					top: 50%;
					transform: translateY(-50%);
					display: flex;
					gap: 6px;
					pointer-events: none;
				}

				.demo-chip-mini {
					display: inline-flex;
					align-items: center;
					padding: 2px 6px;
					border-radius: 999px;
					background: rgba(11, 36, 71, .85);
					border: 1px solid var(--border);
					color: #dbe7ff;
					font-size: 10px;
					line-height: 1;
					white-space: nowrap;
				}

				.demo-agents {
					border: 1px solid var(--border);
					border-radius: 16px;
					background: linear-gradient(180deg, var(--panel) 0%, var(--panel-alt) 100%);
					padding: clamp(8px, 1.4vw, 14px);
					overflow: hidden;
					min-height: 0;
					display: flex;
					flex-direction: column;
				}

				.demo-agent-grid {
					margin-top: 10px;
					display: grid;
					grid-template-columns: repeat(5, minmax(0, 1fr));
					gap: 10px;
					min-height: 0;
					flex: 1;
					align-items: stretch;
				}

				.demo-agent-card {
					background: var(--card);
					border: 1px solid var(--border);
					border-radius: 14px;
					padding: 16px;
					display: grid;
					grid-template-rows: auto auto 1fr auto auto;
					gap: 12px;
					min-height: 0;
					height: 100%;
					cursor: pointer;
					transition: border-color .2s, box-shadow .2s;
				}

				.demo-agent-card:hover {
					border-color: #35508a;
					box-shadow: 0 0 0 1px rgba(110,168,254,.2) inset;
				}

				.demo-agent-top {
					display: flex;
					align-items: flex-start;
					gap: 12px;
					min-height: 60px;
				}

				.demo-avatar {
					width: 36px;
					height: 36px;
					border-radius: 10px;
					display: grid;
					place-items: center;
					font-weight: 800;
					background: linear-gradient(135deg, #1a2c53, #0b2447);
					color: #c8d5ff;
					border: 1px solid var(--border);
					flex-shrink: 0;
				}

				.demo-agent-name {
					font-weight: 700;
				}

				.demo-persona {
					font-size: 12px;
					color: var(--muted);
					line-height: 1.6;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.demo-pick {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					margin-top: 4px;
					min-height: 24px;
				}

				.demo-pick .label {
					font-size: 12px;
					color: var(--muted);
				}

				.demo-pick .choice {
					font-weight: 700;
					color: var(--accent);
				}

				.demo-note {
					font-size: 12px;
					color: var(--muted);
					line-height: 1.7;
					margin-top: 4px;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 6;
					line-clamp: 6;
					-webkit-box-orient: vertical;
				}

				.demo-roi-display {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 6px 10px;
					background: var(--panel);
					border: 1px solid var(--border);
					border-radius: 10px;
				}

				.demo-roi-label {
					font-size: 11px;
					color: var(--muted);
				}

				.demo-roi-value {
					font-weight: 800;
					font-size: 14px;
					color: var(--success);
				}

				.demo-btn-row {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 6px;
				}

				.demo-btn-secondary {
					width: 100%;
					background: #0b2447;
					color: #dbe7ff;
					border: 1px solid var(--border);
					border-radius: 8px;
					padding: 6px 10px;
					font-weight: 700;
					font-size: 11px;
					cursor: pointer;
					transition: background .2s, opacity .2s;
				}

				.demo-btn-secondary:hover {
					background: #0d2b55;
				}

				.demo-invest-btn {
					width: 100%;
					background: linear-gradient(135deg, #2563eb 0%, #22d3ee 100%);
					color: #0b1020;
					border: none;
					border-radius: 8px;
					padding: 6px 10px;
					font-weight: 700;
					font-size: 11px;
					cursor: pointer;
					transition: opacity 0.2s;
				}

				.demo-invest-btn:hover {
					opacity: 0.9;
				}

				@media (max-width: 1100px) {
					.demo-market-body {
						grid-template-columns: 1fr;
					}
					.demo-options {
						grid-template-columns: repeat(5, minmax(0, 1fr));
					}
					.demo-agent-grid {
						grid-template-columns: repeat(3, minmax(0, 1fr));
					}
					.countdown-section {
						gap: 40px;
					}
				}

				@media (max-width: 640px) {
					.demo-options {
						grid-template-columns: repeat(5, minmax(0, 1fr));
					}
					.demo-agent-grid {
						grid-template-columns: repeat(2, minmax(0, 1fr));
					}
					.demo-container {
						grid-template-rows: auto 1.1fr 0.9fr;
					}
					.countdown-section {
						padding: 12px;
					}
					.countdown-item {
						gap: 8px;
					}
					.countdown-label {
						font-size: 11px;
					}
					.flip-card {
						width: 32px;
						height: 42px;
					}
					.flip-card-inner {
						font-size: 22px;
					}
					.time-separator {
						padding: 0 4px;
						gap: 1px;
					}
					.time-separator-label {
						font-size: 9px;
					}
				}
			`}</style>

			<main className="demo-container">
				{/* 倒计时区域 */}
				<section className="countdown-section">
					<div className="countdown-item">
						<div className="countdown-label">
							{t("market.followDeadline")}
						</div>
						<div className="countdown-time">
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{getTimeComponents(followTimeLeft).days}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.days")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).hours,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).hours,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.hours")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).minutes,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).minutes,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.minutes")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).secs,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(
													followTimeLeft,
												).secs,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="countdown-item">
						<div className="countdown-label">
							{t("market.eventDeadline")}
						</div>
						<div className="countdown-time">
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{getTimeComponents(eventTimeLeft).days}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.days")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.hours,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.hours,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.hours")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.minutes,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.minutes,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
							<div className="time-separator">
								<div className="time-separator-label">
									{t("time.minutes")}
								</div>
							</div>
							<div className="countdown-digits">
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.secs,
											).padStart(2, "0")[0]
										}
									</div>
								</div>
								<div className="flip-card">
									<div className="flip-card-inner">
										{
											String(
												getTimeComponents(eventTimeLeft)
													.secs,
											).padStart(2, "0")[1]
										}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* 上半屏：预测市场主体 */}
				<section className="demo-market">
					<div className="demo-market-body">
						<div className="demo-left-col">
							{theme ? (
								<>
									<p className="demo-market-desc text-base">
										{theme.title}
									</p>
									{theme.description && (
										<p className="demo-market-desc">
											{theme.description}
										</p>
									)}
									<div className="demo-options" style={{
										gridTemplateColumns: `repeat(${theme.totalOptions}, minmax(0, 1fr))`
									}}>
										{theme.options.map((option) => (
											<div key={option.optionIndex} className="demo-option-card">
												<div className="demo-option-name">
													{option.label}
												</div>
											</div>
										))}
									</div>
								</>
							) : loading ? (
								<p className="demo-market-desc text-base">
									加载中...
								</p>
							) : (
								<p className="demo-market-desc text-base">
									暂无活跃主题
								</p>
							)}
						</div>

						<aside className="demo-legend">
							{/* <div
								style={{ fontWeight: 700, marginBottom: "8px" }}
							>
								{t("market.reportProbability")}
							</div> */}
							<div className="demo-agent-predictions">
								{/* DeepSeek */}
								<div className="demo-agent-prediction">
									<div className="demo-prediction-chart">
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.a")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cA"
													style={{ width: "40%" }}
												/>
											</div>
											<div className="demo-bar-val">
												40%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.b")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cB"
													style={{ width: "25%" }}
												/>
											</div>
											<div className="demo-bar-val">
												25%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.c")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cC"
													style={{ width: "20%" }}
												/>
											</div>
											<div className="demo-bar-val">
												20%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.d")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cD"
													style={{ width: "10%" }}
												/>
											</div>
											<div className="demo-bar-val">
												10%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.other")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cE"
													style={{ width: "5%" }}
												/>
											</div>
											<div className="demo-bar-val">
												5%
											</div>
										</div>
									</div>
									<div className="demo-agent-prediction-name">
										DeepSeek
									</div>
								</div>

								{/* Claude */}
								<div className="demo-agent-prediction">
									<div className="demo-prediction-chart">
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.a")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cA"
													style={{ width: "20%" }}
												/>
											</div>
											<div className="demo-bar-val">
												20%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.b")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cB"
													style={{ width: "35%" }}
												/>
											</div>
											<div className="demo-bar-val">
												35%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.c")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cC"
													style={{ width: "25%" }}
												/>
											</div>
											<div className="demo-bar-val">
												25%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.d")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cD"
													style={{ width: "15%" }}
												/>
											</div>
											<div className="demo-bar-val">
												15%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.other")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cE"
													style={{ width: "5%" }}
												/>
											</div>
											<div className="demo-bar-val">
												5%
											</div>
										</div>
									</div>
									<div className="demo-agent-prediction-name">
										Claude
									</div>
								</div>

								{/* Grok 4 */}
								<div className="demo-agent-prediction">
									<div className="demo-prediction-chart">
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.a")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cA"
													style={{ width: "15%" }}
												/>
											</div>
											<div className="demo-bar-val">
												15%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.b")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cB"
													style={{ width: "20%" }}
												/>
											</div>
											<div className="demo-bar-val">
												20%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.c")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cC"
													style={{ width: "45%" }}
												/>
											</div>
											<div className="demo-bar-val">
												45%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.d")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cD"
													style={{ width: "12%" }}
												/>
											</div>
											<div className="demo-bar-val">
												12%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.other")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cE"
													style={{ width: "8%" }}
												/>
											</div>
											<div className="demo-bar-val">
												8%
											</div>
										</div>
									</div>
									<div className="demo-agent-prediction-name">
										Grok 4
									</div>
								</div>

								{/* Qwen */}
								<div className="demo-agent-prediction">
									<div className="demo-prediction-chart">
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.a")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cA"
													style={{ width: "38%" }}
												/>
											</div>
											<div className="demo-bar-val">
												38%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.b")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cB"
													style={{ width: "22%" }}
												/>
											</div>
											<div className="demo-bar-val">
												22%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.c")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cC"
													style={{ width: "25%" }}
												/>
											</div>
											<div className="demo-bar-val">
												25%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.d")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cD"
													style={{ width: "10%" }}
												/>
											</div>
											<div className="demo-bar-val">
												10%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.other")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cE"
													style={{ width: "5%" }}
												/>
											</div>
											<div className="demo-bar-val">
												5%
											</div>
										</div>
									</div>
									<div className="demo-agent-prediction-name">
										Qwen
									</div>
								</div>

								{/* GPT */}
								<div className="demo-agent-prediction">
									<div className="demo-prediction-chart">
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.a")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cA"
													style={{ width: "22%" }}
												/>
											</div>
											<div className="demo-bar-val">
												22%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.b")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cB"
													style={{ width: "32%" }}
												/>
											</div>
											<div className="demo-bar-val">
												32%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.c")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cC"
													style={{ width: "25%" }}
												/>
											</div>
											<div className="demo-bar-val">
												25%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.d")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cD"
													style={{ width: "16%" }}
												/>
											</div>
											<div className="demo-bar-val">
												16%
											</div>
										</div>
										<div className="demo-bar">
											<div className="demo-bar-label">
												{t("candidates.other")}
											</div>
											<div className="demo-bar-track">
												<div
													className="demo-bar-fill demo-cE"
													style={{ width: "5%" }}
												/>
											</div>
											<div className="demo-bar-val">
												5%
											</div>
										</div>
									</div>
									<div className="demo-agent-prediction-name">
										GPT
									</div>
								</div>
							</div>
						</aside>
					</div>
				</section>

				{/* 下半屏：Agent 列表 */}
				<section className="demo-agents">
					<div className="demo-agent-grid" style={{
						gridTemplateColumns: `repeat(${Math.min(agents.length, 5)}, minmax(0, 1fr))`
					}}>
						{loading ? (
							<div className="demo-agent-card">
								<div className="demo-agent-top">
									<div>Loading agents...</div>
								</div>
							</div>
						) : agents.length > 0 ? (
							agents.map((agent) => (
								<div
									key={agent.id}
									className="demo-agent-card"
									onClick={() => handleOpenAgentDetail(agent.name)}
								>
									<div className="demo-agent-top">
										{agent.avatarUrl ? (
											<img
												src={agent.avatarUrl}
												alt={agent.name}
												className="demo-avatar"
												style={{ width: '36px', height: '36px', borderRadius: '10px' }}
											/>
										) : (
											<div className="demo-avatar">
												{agent.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div>
											<div className="demo-agent-name">
												{agent.name}
											</div>
											{agent.description && (
												<div className="demo-persona">
													{agent.description}
												</div>
											)}
										</div>
									</div>
									<div className="demo-roi-display">
										<span className="demo-roi-label">
											Agent ID
										</span>
										<span className="demo-roi-value">#{agent.agentId}</span>
									</div>
									<div className="demo-note" style={{ fontSize: '11px', opacity: 0.7 }}>
										{agent.agentPda.substring(0, 32)}...
									</div>

									<div className="demo-btn-row">
										<button
											type="button"
											className="demo-btn-secondary"
											onClick={(e) => {
												e.stopPropagation();
												handleOpenReport(agent.name);
											}}
										>
											{t("actions.report")}
										</button>
										<button
											type="button"
											className="demo-invest-btn"
											onClick={(e) => {
												e.stopPropagation();
												handleOpenInvest(agent);
											}}
										>
											{t("actions.invest")}
										</button>
									</div>
								</div>
							))
						) : (
							<div className="demo-agent-card">
								<div className="demo-agent-top">
									<div>暂无可用 Agent</div>
								</div>
							</div>
						)}
					</div>
				</section>
			</main>

			{/* 弹窗组件 */}
			<DemoReportDialog
				open={reportDialogOpen}
				onOpenChange={setReportDialogOpen}
				agent={reportAgent}
			/>
			<DemoAgentDetailDialog
				open={agentDetailDialogOpen}
				onOpenChange={setAgentDetailDialogOpen}
				agent={detailAgent}
			/>
			<DemoInvestDialog
				open={investDialogOpen}
				onOpenChange={setInvestDialogOpen}
				agent={investAgent}
				theme={theme}
			/>
		</>
	);
}
