"use client";

import {
	adminAgentOrdersQueryKey,
	useAdminAgentOrdersQuery,
	useCreateAdminAgentOrderMutation,
	useDeleteAdminAgentOrderMutation,
	useUpdateAdminAgentOrderMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
	emptyToUndefined,
	formatDateTimeLocal,
	formatDecimalInput,
} from "@saas/admin/lib/form-helpers";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { Spinner } from "@shared/components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
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

const DEFAULT_LIMIT = 30;

type OrderFormState = {
	agentId: string;
	eventId: string;
	marketId: string;
	reportId: string;
	stakeAmount: string;
	stakeCurrency: string;
	expectedRoiPct: string;
	status: string;
	notes: string;
	txHash: string;
	executedAt: string;
	createdById: string;
};

const defaultFormState: OrderFormState = {
	agentId: "",
	eventId: "",
	marketId: "",
	reportId: "",
	stakeAmount: "",
	stakeCurrency: "USDC",
	expectedRoiPct: "",
	status: "PENDING",
	notes: "",
	txHash: "",
	executedAt: "",
	createdById: "",
};

export function AgentOrderManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] =
		useState<OrderFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminAgentOrdersQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createOrder = useCreateAdminAgentOrderMutation();
	const updateOrder = useUpdateAdminAgentOrderMutation();
	const deleteOrder = useDeleteAdminAgentOrderMutation();

	const orders = data?.orders ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				agentId: formState.agentId,
				eventId: formState.eventId,
				marketId: formState.marketId,
				reportId: emptyToNull(formState.reportId),
				stakeAmount: formState.stakeAmount,
				stakeCurrency: formState.stakeCurrency,
				expectedRoiPct: emptyToNull(formState.expectedRoiPct),
				status: formState.status,
				notes: emptyToNull(formState.notes),
				txHash: emptyToNull(formState.txHash),
				executedAt: emptyToNull(formState.executedAt),
				createdById: emptyToNull(formState.createdById),
			};

			if (editingId) {
				await updateOrder.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(t("admin.agentOrders.notifications.updated"));
			} else {
				await createOrder.mutateAsync(payload);
				toast.success(t("admin.agentOrders.notifications.created"));
			}

			queryClient.invalidateQueries({
				queryKey: adminAgentOrdersQueryKey,
			});
			resetForm();
		} catch (error) {
			toast.error(t("admin.agentOrders.notifications.error"));
		}
	};

	const handleEdit = (order: (typeof orders)[number]) => {
		setEditingId(order.id);
		setFormState({
			agentId: order.agentId,
			eventId: order.eventId,
			marketId: order.marketId,
			reportId: order.reportId ?? "",
			stakeAmount: formatDecimalInput(order.stakeAmount),
			stakeCurrency: order.stakeCurrency ?? "",
			expectedRoiPct: formatDecimalInput(order.expectedRoiPct),
			status: order.status ?? "",
			notes: order.notes ?? "",
			txHash: order.txHash ?? "",
			executedAt: formatDateTimeLocal(order.executedAt),
			createdById: order.createdById ?? "",
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
					await deleteOrder.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminAgentOrdersQueryKey,
					});
					toast.success(
						t("admin.agentOrders.notifications.deleted"),
					);
				} catch {
					toast.error(t("admin.agentOrders.notifications.error"));
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.agentOrders.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{(["agentId", "eventId", "marketId"] as const).map(
								(field) => (
									<div className="space-y-1" key={field}>
										<label className="text-sm font-medium">
											{t(
												`admin.agentOrders.fields.${field}`,
											)}
										</label>
										<Input
											value={formState[field]}
											onChange={(e) =>
												setFormState((prev) => ({
													...prev,
													[field]: e.target.value,
												}))
											}
											required
										/>
									</div>
								),
							)}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.stakeAmount")}
								</label>
								<Input
									value={formState.stakeAmount}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											stakeAmount: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t(
										"admin.agentOrders.fields.stakeCurrency",
									)}
								</label>
								<Input
									value={formState.stakeCurrency}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											stakeCurrency: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t(
										"admin.agentOrders.fields.expectedRoiPct",
									)}
								</label>
								<Input
									value={formState.expectedRoiPct}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											expectedRoiPct: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.status")}
								</label>
								<Input
									value={formState.status}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											status: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.reportId")}
								</label>
								<Input
									value={formState.reportId}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											reportId: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.createdById")}
								</label>
								<Input
									value={formState.createdById}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											createdById: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1 md:col-span-2">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.notes")}
								</label>
								<Textarea
									value={formState.notes}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											notes: e.target.value,
										}))
									}
									rows={3}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentOrders.fields.txHash")}
								</label>
								<Input
									value={formState.txHash}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											txHash: e.target.value,
										}))
									}
								/>
								<label className="mt-2 block text-sm font-medium">
									{t("admin.agentOrders.fields.executedAt")}
								</label>
								<Input
									type="datetime-local"
									value={formState.executedAt}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											executedAt: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createOrder.isPending ||
									updateOrder.isPending
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
					<CardTitle>{t("admin.agentOrders.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t(
								"admin.agentOrders.searchPlaceholder",
							)}
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
										{t("admin.agentOrders.fields.agentId")}
									</TableHead>
									<TableHead>
										{t("admin.agentOrders.fields.marketId")}
									</TableHead>
									<TableHead>
										{t("admin.agentOrders.fields.status")}
									</TableHead>
									<TableHead>
										{t(
											"admin.agentOrders.fields.stakeAmount",
										)}
									</TableHead>
									<TableHead>{t("admin.agentOrders.fields.expectedRoiPct")}</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6}>
											<div className="flex items-center gap-2">
												<Spinner className="size-4" />
												{t("admin.common.state.loading")}
											</div>
										</TableCell>
									</TableRow>
								) : orders.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									orders.map((order) => (
										<TableRow key={order.id}>
											<TableCell className="font-mono text-xs">
												{order.id}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{order.agent?.slug ??
													order.agentId}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{order.market?.slug ??
													order.marketId}
											</TableCell>
											<TableCell>{order.status}</TableCell>
											<TableCell>
												{formatDecimalInput(
													order.stakeAmount,
												)}{" "}
												{order.stakeCurrency}
											</TableCell>
											<TableCell>
												{formatDecimalInput(
													order.expectedRoiPct,
												)}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(order)
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
														handleDelete(order.id)
													}
													loading={
														deleteOrder.isPending
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
