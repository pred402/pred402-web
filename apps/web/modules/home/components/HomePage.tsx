"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DemoAgentDetailDialog } from "./DemoAgentDetailDialog";
import { DemoInvestDialog } from "./DemoInvestDialog";
import { DemoReportDialog } from "./DemoReportDialog";

export function HomePage() {
	const t = useTranslations("home");

	// 倒计时状态
	// 事件截至时间：2 天 08 小时 = 56 小时 = 201600 秒
	const [eventTimeLeft, setEventTimeLeft] = useState(201600);
	// 跟投截至时间：事件截至 - 6 小时 = 50 小时 = 180000 秒
	const [followTimeLeft, setFollowTimeLeft] = useState(180000);

	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const [reportAgent, setReportAgent] = useState<string | null>(null);

	const [agentDetailDialogOpen, setAgentDetailDialogOpen] = useState(false);
	const [detailAgent, setDetailAgent] = useState<string | null>(null);

	const [investDialogOpen, setInvestDialogOpen] = useState(false);
	const [investAgent, setInvestAgent] = useState<string | null>(null);

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

	const handleOpenInvest = (agent: string) => {
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
					gap: 32px;
					justify-content: center;
					align-items: center;
					padding: 16px;
					background: linear-gradient(180deg, var(--panel) 0%, var(--panel-alt) 100%);
					border: 1px solid var(--border);
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
					color: var(--accent);
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
					color: var(--brand);
					position: relative;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
				}

				.flip-card-inner::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					right: 0;
					height: 1px;
					background: rgba(0, 0, 0, 0.4);
				}

				.flip-card-inner::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					right: 0;
					height: 1px;
					background: var(--border);
					transform: translateY(-1px);
				}

				.time-separator {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 2px;
					padding: 0 8px;
				}

				.time-separator-label {
					font-size: 11px;
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

				.demo-title {
					font-size: clamp(16px, 2vw, 26px);
					font-weight: 700;
					letter-spacing: 0.2px;
					line-height: 1.6;
					margin-bottom: 12px;
				}

				.demo-market-desc {
					color: var(--muted);
					margin-top: 0;
					font-size: 12px;
					line-height: 1.8;
				}

				.demo-market-body {
					display: grid;
					grid-template-columns: 2fr 3fr;
					gap: 12px;
					padding-top: 0;
					min-height: 0;
					flex: 1;
					align-items: start;
				}

				.demo-left-col {
					display: flex;
					flex-direction: column;
					gap: 1px;
					min-height: 0;
					overflow: hidden;
					flex: 1;
				}

				.demo-options {
					display: grid;
					grid-template-columns: repeat(5, minmax(0, 1fr));
					gap: 8px;
					grid-auto-rows: min-content;
					flex-shrink: 0;
					margin-top: 12px;
				}

				.demo-option-card {
					background: var(--card);
					border: 1px solid var(--border);
					border-radius: 14px;
					padding: 8px 20px;
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
							<div className="demo-title">
								{t("market.title")}
							</div>
							<p className="demo-market-desc text-base">
								{t("market.ruleDesc")}
							</p>
							<p className="demo-market-desc">
								{t("market.resolution")}
							</p>
							<div className="demo-options">
								<div className="demo-option-card">
									<div className="demo-option-name">
										{t("candidates.a")}
									</div>
								</div>
								<div className="demo-option-card">
									<div className="demo-option-name">
										{t("candidates.b")}
									</div>
								</div>
								<div className="demo-option-card">
									<div className="demo-option-name">
										{t("candidates.c")}
									</div>
								</div>
								<div className="demo-option-card">
									<div className="demo-option-name">
										{t("candidates.d")}
									</div>
								</div>
								<div className="demo-option-card">
									<div className="demo-option-name">
										{t("candidates.other")}
									</div>
								</div>
							</div>
						</div>

						<aside className="demo-legend">
							<div
								style={{ fontWeight: 700, marginBottom: "8px" }}
							>
								{t("market.reportProbability")}
							</div>
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

				{/* 下半屏：五个 Agent 横排 */}
				<section className="demo-agents">
					<div className="demo-agent-grid">
						{/* DeepSeek */}
						<div
							className="demo-agent-card"
							onClick={() => handleOpenAgentDetail("DeepSeek")}
						>
							<div className="demo-agent-top">
								<div className="demo-avatar">D</div>
								<div>
									<div className="demo-agent-name">
										DeepSeek
									</div>
									<div className="demo-persona">
										{t("agents.deepseek.persona")}
									</div>
								</div>
							</div>
							{/* <div className="demo-pick">
								<span className="choice">
									{t("candidates.a")}
								</span>
								<span className="label">
									{t("actions.bet")}
								</span>
							</div> */}
							<div className="demo-roi-display">
								<span className="demo-roi-label">
									{t("actions.roi")}
								</span>
								<span className="demo-roi-value">+24.5%</span>
							</div>
							<div className="demo-note">
								{t("agents.deepseek.note")}
							</div>

							<div className="demo-btn-row">
								<button
									type="button"
									className="demo-btn-secondary"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenReport("DeepSeek");
									}}
								>
									{t("actions.report")}
								</button>
								<button
									type="button"
									className="demo-invest-btn"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenInvest("DeepSeek");
									}}
								>
									{t("actions.invest")}
								</button>
							</div>
						</div>

						{/* Claude */}
						<div
							className="demo-agent-card"
							onClick={() => handleOpenAgentDetail("Claude")}
						>
							<div className="demo-agent-top">
								<div className="demo-avatar">C</div>
								<div>
									<div className="demo-agent-name">
										Claude
									</div>
									<div className="demo-persona">
										{t("agents.claude.persona")}
									</div>
								</div>
							</div>
							{/* <div className="demo-pick">
								<span className="label">
									{t("actions.bet")}
								</span>
								<span className="choice">
									{t("candidates.b")}
								</span>
							</div> */}
							<div className="demo-roi-display">
								<span className="demo-roi-label">
									{t("actions.roi")}
								</span>
								<span className="demo-roi-value">+18.2%</span>
							</div>
							<div className="demo-note">
								{t("agents.claude.note")}
							</div>

							<div className="demo-btn-row">
								<button
									type="button"
									className="demo-btn-secondary"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenReport("Claude");
									}}
								>
									{t("actions.report")}
								</button>
								<button
									type="button"
									className="demo-invest-btn"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenInvest("Claude");
									}}
								>
									{t("actions.invest")}
								</button>
							</div>
						</div>

						{/* Grok 4 */}
						<div
							className="demo-agent-card"
							onClick={() => handleOpenAgentDetail("Grok 4")}
						>
							<div className="demo-agent-top">
								<div className="demo-avatar">G</div>
								<div>
									<div className="demo-agent-name">
										Grok 4
									</div>
									<div className="demo-persona">
										{t("agents.grok.persona")}
									</div>
								</div>
							</div>
							{/* <div className="demo-pick">
								<span className="label">
									{t("actions.bet")}
								</span>
								<span className="choice">
									{t("candidates.c")}
								</span>
							</div> */}
							<div className="demo-roi-display">
								<span className="demo-roi-label">
									{t("actions.roi")}
								</span>
								<span className="demo-roi-value">+31.7%</span>
							</div>
							<div className="demo-note">
								{t("agents.grok.note")}
							</div>

							<div className="demo-btn-row">
								<button
									type="button"
									className="demo-btn-secondary"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenReport("Grok 4");
									}}
								>
									{t("actions.report")}
								</button>
								<button
									type="button"
									className="demo-invest-btn"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenInvest("Grok 4");
									}}
								>
									{t("actions.invest")}
								</button>
							</div>
						</div>

						{/* Qwen */}
						<div
							className="demo-agent-card"
							onClick={() => handleOpenAgentDetail("Qwen")}
						>
							<div className="demo-agent-top">
								<div className="demo-avatar">Q</div>
								<div>
									<div className="demo-agent-name">Qwen</div>
									<div className="demo-persona">
										{t("agents.qwen.persona")}
									</div>
								</div>
							</div>
							{/* <div className="demo-pick">
								<span className="label">
									{t("actions.bet")}
								</span>
								<span className="choice">
									{t("candidates.a")}
								</span>
							</div> */}
							<div className="demo-roi-display">
								<span className="demo-roi-label">
									{t("actions.roi")}
								</span>
								<span className="demo-roi-value">+22.1%</span>
							</div>
							<div className="demo-note">
								{t("agents.qwen.note")}
							</div>

							<div className="demo-btn-row">
								<button
									type="button"
									className="demo-btn-secondary"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenReport("Qwen");
									}}
								>
									{t("actions.report")}
								</button>
								<button
									type="button"
									className="demo-invest-btn"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenInvest("Qwen");
									}}
								>
									{t("actions.invest")}
								</button>
							</div>
						</div>

						{/* GPT */}
						<div
							className="demo-agent-card"
							onClick={() => handleOpenAgentDetail("GPT")}
						>
							<div className="demo-agent-top">
								<div className="demo-avatar">G</div>
								<div>
									<div className="demo-agent-name">GPT</div>
									<div className="demo-persona">
										{t("agents.gpt.persona")}
									</div>
								</div>
							</div>
							{/* <div className="demo-pick">
								<span className="label">
									{t("actions.bet")}
								</span>
								<span className="choice">
									{t("candidates.b")}
								</span>
							</div> */}
							<div className="demo-roi-display">
								<span className="demo-roi-label">
									{t("actions.roi")}
								</span>
								<span className="demo-roi-value">+19.8%</span>
							</div>
							<div className="demo-note">
								{t("agents.gpt.note")}
							</div>

							<div className="demo-btn-row">
								<button
									type="button"
									className="demo-btn-secondary"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenReport("GPT");
									}}
								>
									{t("actions.report")}
								</button>
								<button
									type="button"
									className="demo-invest-btn"
									onClick={(e) => {
										e.stopPropagation();
										handleOpenInvest("GPT");
									}}
								>
									{t("actions.invest")}
								</button>
							</div>
						</div>
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
			/>
		</>
	);
}
