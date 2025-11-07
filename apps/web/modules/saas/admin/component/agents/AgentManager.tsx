"use client";

import {
	adminAgentsQueryKey,
	useAdminAgentsQuery,
	useCreateAdminAgentMutation,
	useDeleteAdminAgentMutation,
	useUpdateAdminAgentMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
	emptyToUndefined,
	parseJsonField,
	stringifyJsonField,
} from "@saas/admin/lib/form-helpers";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { Spinner } from "@shared/components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_LIMIT = 50;

type AgentFormState = {
	slug: string;
	name: string;
	description: string;
	avatarUrl: string;
	modelVendor: string;
	modelName: string;
	isActive: "true" | "false";
	metadataJson: string;
};

const defaultFormState: AgentFormState = {
	slug: "",
	name: "",
	description: "",
	avatarUrl: "",
	modelVendor: "",
	modelName: "",
	isActive: "true",
	metadataJson: "",
};

export function AgentManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] =
		useState<AgentFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminAgentsQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createAgent = useCreateAdminAgentMutation();
	const updateAgent = useUpdateAdminAgentMutation();
	const deleteAgent = useDeleteAdminAgentMutation();

	const agents = data?.agents ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				slug: formState.slug,
				name: formState.name,
				description: emptyToNull(formState.description),
				avatarUrl: emptyToNull(formState.avatarUrl),
				modelVendor: formState.modelVendor,
				modelName: formState.modelName,
				isActive: formState.isActive === "true",
				metadata: formState.metadataJson
					? parseJsonField(formState.metadataJson, {})
					: null,
			};

			if (editingId) {
				await updateAgent.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(t("admin.agents.notifications.updated"));
			} else {
				await createAgent.mutateAsync(payload);
				toast.success(t("admin.agents.notifications.created"));
			}

			queryClient.invalidateQueries({ queryKey: adminAgentsQueryKey });
			resetForm();
		} catch (error) {
			if (error instanceof Error && error.message === "INVALID_JSON") {
				toast.error(t("admin.common.messages.jsonError"));
				return;
			}

			toast.error(t("admin.agents.notifications.error"));
		}
	};

	const handleEdit = (agent: (typeof agents)[number]) => {
		setEditingId(agent.id);
		setFormState({
			slug: agent.slug,
			name: agent.name,
			description: agent.description ?? "",
			avatarUrl: agent.avatarUrl ?? "",
			modelVendor: agent.modelVendor ?? "",
			modelName: agent.modelName ?? "",
			isActive: agent.isActive ? "true" : "false",
			metadataJson: stringifyJsonField(agent.metadata),
		});
	};

	const handleDelete = (id: string) => {
		confirm({
			title: t("admin.common.confirmDelete.title"),
			message: t("admin.common.confirmDelete.message"),
			confirmLabel: t("admin.common.actions.delete"),
			destructive: true,
			onConfirm: async () => {
				try {
					await deleteAgent.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminAgentsQueryKey,
					});
					toast.success(t("admin.agents.notifications.deleted"));
				} catch {
					toast.error(t("admin.agents.notifications.error"));
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.agents.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.slug")}
								</label>
								<Input
									value={formState.slug}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											slug: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.name")}
								</label>
								<Input
									value={formState.name}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.modelVendor")}
								</label>
								<Input
									value={formState.modelVendor}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											modelVendor: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.modelName")}
								</label>
								<Input
									value={formState.modelName}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											modelName: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.description")}
								</label>
								<Textarea
									value={formState.description}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									rows={3}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agents.fields.avatarUrl")}
								</label>
								<Input
									value={formState.avatarUrl}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											avatarUrl: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.agents.fields.isActive")}
							</label>
							<Select
								value={formState.isActive}
								onValueChange={(value: "true" | "false") =>
									setFormState((prev) => ({
										...prev,
										isActive: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">
										{t("admin.agents.status.active")}
									</SelectItem>
									<SelectItem value="false">
										{t("admin.agents.status.paused")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.agents.fields.metadata")}
							</label>
							<Textarea
								value={formState.metadataJson}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										metadataJson: e.target.value,
									}))
								}
								rows={4}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createAgent.isPending ||
									updateAgent.isPending
								}
							>
								{editingId
									? t("admin.common.actions.update")
									: t("admin.common.actions.create")}
							</Button>
							{editingId && (
								<Button
									type="button"
									variant="secondary"
									onClick={resetForm}
								>
									{t("admin.common.actions.cancelEdit")}
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("admin.agents.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t("admin.agents.searchPlaceholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>
										{t("admin.agents.fields.slug")}
									</TableHead>
									<TableHead>
										{t("admin.agents.fields.name")}
									</TableHead>
									<TableHead>
										{t("admin.agents.fields.modelVendor")}
									</TableHead>
									<TableHead>
										{t("admin.agents.fields.modelName")}
									</TableHead>
									<TableHead>
										{t("admin.agents.fields.isActive")}
									</TableHead>
									<TableHead>{t("admin.agents.stats")}</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={7}>
											<div className="flex items-center gap-2">
												<Spinner className="size-4" />
												{t("admin.common.state.loading")}
											</div>
										</TableCell>
									</TableRow>
								) : agents.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									agents.map((agent) => (
										<TableRow key={agent.id}>
											<TableCell className="font-mono text-xs">
												{agent.id}
											</TableCell>
											<TableCell>{agent.slug}</TableCell>
											<TableCell>{agent.name}</TableCell>
											<TableCell>
												{agent.modelVendor}
											</TableCell>
											<TableCell>{agent.modelName}</TableCell>
											<TableCell>
												{agent.isActive
													? t(
															"admin.agents.status.active",
														)
													: t(
															"admin.agents.status.paused",
														)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{t("admin.agents.metrics", {
													reports: agent.reportsCount,
													orders: agent.ordersCount,
													investments:
														agent.investmentsCount,
												})}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(agent)
													}
												>
													{t(
														"admin.common.actions.edit",
													)}
												</Button>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() =>
														handleDelete(agent.id)
													}
													loading={
														deleteAgent.isPending
													}
												>
													{t(
														"admin.common.actions.delete",
													)}
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
