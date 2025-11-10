"use client";

import {
	adminUserInvestmentsQueryKey,
	useAdminUserInvestmentsQuery,
	useCreateAdminUserInvestmentMutation,
	useDeleteAdminUserInvestmentMutation,
	useUpdateAdminUserInvestmentMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
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

type InvestmentFormState = {
	userId: string;
	agentId: string;
	eventId: string;
	marketId: string;
	agentOrderId: string;
	amount: string;
	currency: string;
	status: string;
	txHash: string;
	expectedRoiPct: string;
	settledPnl: string;
	notes: string;
};

const defaultFormState: InvestmentFormState = {
	userId: "",
	agentId: "",
	eventId: "",
	marketId: "",
	agentOrderId: "",
	amount: "",
	currency: "USDC",
	status: "PENDING",
	txHash: "",
	expectedRoiPct: "",
	settledPnl: "",
	notes: "",
};

export function UserInvestmentManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] = useState<InvestmentFormState>(
		defaultFormState,
	);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminUserInvestmentsQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createInvestment = useCreateAdminUserInvestmentMutation();
	const updateInvestment = useUpdateAdminUserInvestmentMutation();
	const deleteInvestment = useDeleteAdminUserInvestmentMutation();

	const investments = data?.investments ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				userId: formState.userId,
				agentId: formState.agentId,
				eventId: formState.eventId,
				marketId: formState.marketId,
				agentOrderId: emptyToNull(formState.agentOrderId),
				amount: formState.amount,
				currency: formState.currency,
				status: formState.status,
				txHash: emptyToNull(formState.txHash),
				expectedRoiPct: emptyToNull(formState.expectedRoiPct),
				settledPnl: emptyToNull(formState.settledPnl),
				notes: emptyToNull(formState.notes),
			};

			if (editingId) {
				await updateInvestment.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(
					t("admin.userInvestments.notifications.updated"),
				);
			} else {
				await createInvestment.mutateAsync(payload);
				toast.success(
					t("admin.userInvestments.notifications.created"),
				);
			}

			queryClient.invalidateQueries({
				queryKey: adminUserInvestmentsQueryKey,
			});
			resetForm();
		} catch (error) {
			toast.error(t("admin.userInvestments.notifications.error"));
		}
	};

	const handleEdit = (record: (typeof investments)[number]) => {
		setEditingId(record.id);
		setFormState({
			userId: record.userId,
			agentId: record.agentId,
			eventId: record.eventId,
			marketId: record.marketId,
			agentOrderId: record.agentOrderId ?? "",
			amount: formatDecimalInput(record.amount),
			currency: record.currency ?? "",
			status: record.status ?? "",
			txHash: record.txHash ?? "",
			expectedRoiPct: formatDecimalInput(record.expectedRoiPct),
			settledPnl: formatDecimalInput(record.settledPnl),
			notes: record.notes ?? "",
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
					await deleteInvestment.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminUserInvestmentsQueryKey,
					});
					toast.success(
						t("admin.userInvestments.notifications.deleted"),
					);
				} catch {
					toast.error(t("admin.userInvestments.notifications.error"));
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.userInvestments.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{(
								[
									"userId",
									"agentId",
									"marketId",
								] as const
							).map((field) => (
								<div className="space-y-1" key={field}>
									<label className="text-sm font-medium">
										{t(
											`admin.userInvestments.fields.${field}`,
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
							))}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.eventId")}
								</label>
								<Input
									value={formState.eventId}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											eventId: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t(
										"admin.userInvestments.fields.agentOrderId",
									)}
								</label>
								<Input
									value={formState.agentOrderId}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											agentOrderId: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.status")}
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
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.amount")}
								</label>
								<Input
									value={formState.amount}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											amount: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.currency")}
								</label>
								<Input
									value={formState.currency}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											currency: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t(
										"admin.userInvestments.fields.expectedRoiPct",
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

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.txHash")}
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
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.userInvestments.fields.settledPnl")}
								</label>
								<Input
									value={formState.settledPnl}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											settledPnl: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.userInvestments.fields.notes")}
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

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createInvestment.isPending ||
									updateInvestment.isPending
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
					<CardTitle>
						{t("admin.userInvestments.tableTitle")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t(
								"admin.userInvestments.searchPlaceholder",
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
										{t("admin.userInvestments.fields.userId")}
									</TableHead>
									<TableHead>
										{t("admin.userInvestments.fields.agentId")}
									</TableHead>
									<TableHead>
										{t("admin.userInvestments.fields.status")}
									</TableHead>
									<TableHead>
										{t("admin.userInvestments.fields.amount")}
									</TableHead>
									<TableHead>
										{t(
											"admin.userInvestments.fields.expectedRoiPct",
										)}
									</TableHead>
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
								) : investments.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									investments.map((inv: any) => (
										<TableRow key={inv.id}>
											<TableCell className="font-mono text-xs">
												{inv.id}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{inv.user?.email ?? inv.userId}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{inv.agent?.slug ?? inv.agentId}
											</TableCell>
											<TableCell>{inv.status}</TableCell>
											<TableCell>
												{formatDecimalInput(inv.amount)}{" "}
												{inv.currency}
											</TableCell>
											<TableCell>
												{formatDecimalInput(
													inv.expectedRoiPct,
												)}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(inv)
													}
												>
													{t(
														"admin.common.actions.edit",
													)}
												</Button>
												<Button
													type="button"
													variant="error"
													size="sm"
													onClick={() =>
														handleDelete(inv.id)
													}
													loading={
														deleteInvestment.isPending
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
