"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { OrganizationsGrid } from "@saas/organizations/components/OrganizationsGrid";
import { Card } from "@ui/components/card";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ThemeCard } from "@saas/prediction/components/ThemeCard";
import { AgentCard } from "@saas/prediction/components/AgentCard";

interface ThemeOption {
	optionIndex: number;
	label: string;
	labelUri: string;
	optionStatePda: string;
	optionVaultPda: string;
	optionVaultAuthorityPda: string;
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
	txSignature: string;
	createdAt: string;
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
	authorityPubkey: string;
	createdAt: string;
}

export default function UserStart() {
	const t = useTranslations();
	const { user } = useSession();
	const [themes, setThemes] = useState<Theme[]>([]);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [themesRes, agentsRes] = await Promise.all([
					fetch('/api/themes'),
					fetch('/api/agents'),
				]);

				const themesData = await themesRes.json();
				const agentsData = await agentsRes.json();

				if (themesData.success) {
					setThemes(themesData.data);
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

	return (
		<div>
			{config.organizations.enable && <OrganizationsGrid />}

			<div className="mt-6 space-y-8">
				{/* Active Themes Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">活跃预测主题</h2>
					{loading ? (
						<Card className="p-8">
							<div className="flex items-center justify-center text-muted-foreground">
								加载中...
							</div>
						</Card>
					) : themes.length > 0 ? (
						<div className="grid gap-6 md:grid-cols-2">
							{themes.map((theme) => (
								<ThemeCard key={theme.id} theme={theme} />
							))}
						</div>
					) : (
						<Card className="p-8">
							<div className="flex items-center justify-center text-muted-foreground">
								暂无活跃的预测主题
							</div>
						</Card>
					)}
				</section>

				{/* AI Agents Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">AI 预测专家</h2>
					{loading ? (
						<Card className="p-8">
							<div className="flex items-center justify-center text-muted-foreground">
								加载中...
							</div>
						</Card>
					) : agents.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{agents.map((agent) => (
								<AgentCard key={agent.id} agent={agent} />
							))}
						</div>
					) : (
						<Card className="p-8">
							<div className="flex items-center justify-center text-muted-foreground">
								暂无可用的 AI 专家
							</div>
						</Card>
					)}
				</section>
			</div>
		</div>
	);
}
