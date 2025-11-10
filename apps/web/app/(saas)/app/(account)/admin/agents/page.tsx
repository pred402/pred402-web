import { AgentManager } from "@saas/admin/component/agents/AgentManager";

export default function AdminAgentsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">AI Agents</h1>
				<p className="text-muted-foreground">
					Create and manage AI prediction agents on Solana blockchain
				</p>
			</div>
			<AgentManager />
		</div>
	);
}
