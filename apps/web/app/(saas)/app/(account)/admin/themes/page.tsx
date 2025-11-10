import { ThemeManager } from "@saas/admin/component/themes/ThemeManager";

export default function AdminThemesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Prediction Themes</h1>
				<p className="text-muted-foreground">
					Create and manage prediction market themes on Solana blockchain
				</p>
			</div>
			<ThemeManager />
		</div>
	);
}
