import { config } from "@repo/config";
import { getSession } from "@saas/auth/lib/server";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { SidebarContentLayout } from "@saas/shared/components/SidebarContentLayout";
import { Logo } from "@shared/components/Logo";
import {
	BotIcon,
	Building2Icon,
	CalendarDaysIcon,
	FileTextIcon,
	LayersIcon,
	PackageIcon,
	PercentCircleIcon,
	UsersIcon,
	WalletIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/app");
	}

	return (
		<>
			<PageHeader
				title={t("admin.title")}
				subtitle={t("admin.description")}
			/>
			<SidebarContentLayout
				sidebar={
					<SettingsMenu
						menuItems={[
							{
								avatar: (
									<Logo
										className="size-8"
										withLabel={false}
									/>
								),
								title: t("admin.title"),
								items: [
									{
										title: t("admin.menu.users"),
										href: "/app/admin/users",
										icon: (
											<UsersIcon className="size-4 opacity-50" />
										),
									},
									...(config.organizations.enable
										? [
												{
													title: t(
														"admin.menu.organizations",
													),
													href: "/app/admin/organizations",
													icon: (
														<Building2Icon className="size-4 opacity-50" />
													),
												},
											]
										: []),
									{
										title: t("admin.menu.events"),
										href: "/app/admin/events",
										icon: (
											<CalendarDaysIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.markets"),
										href: "/app/admin/markets",
										icon: (
											<LayersIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.agents"),
										href: "/app/admin/agents",
										icon: (
											<BotIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.reports"),
										href: "/app/admin/reports",
										icon: (
											<FileTextIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.reportProbabilities"),
										href: "/app/admin/report-probabilities",
										icon: (
											<PercentCircleIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.orders"),
										href: "/app/admin/orders",
										icon: (
											<PackageIcon className="size-4 opacity-50" />
										),
									},
									{
										title: t("admin.menu.investments"),
										href: "/app/admin/investments",
										icon: (
											<WalletIcon className="size-4 opacity-50" />
										),
									},
								],
							},
						]}
					/>
				}
			>
				{children}
			</SidebarContentLayout>
		</>
	);
}
