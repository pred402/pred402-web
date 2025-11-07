"use client";

import {
	adminProbabilitiesQueryKey,
	useAdminProbabilitiesQuery,
	useCreateAdminProbabilityMutation,
	useDeleteAdminProbabilityMutation,
	useUpdateAdminProbabilityMutation,
} from "@saas/admin/lib/api";
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

const DEFAULT_LIMIT = 50;

type ProbabilityFormState = {
	reportId: string;
	marketId: string;
	probability: string;
	rationale: string;
};

const defaultFormState: ProbabilityFormState = {
	reportId: "",
	marketId: "",
	probability: "",
	rationale: "",
};

export function ReportProbabilityManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] =
		useState<ProbabilityFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<number | null>(null);

	const { data, isLoading } = useAdminProbabilitiesQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createProbability = useCreateAdminProbabilityMutation();
	const updateProbability = useUpdateAdminProbabilityMutation();
	const deleteProbability = useDeleteAdminProbabilityMutation();

	const probabilities = data?.probabilities ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				reportId: formState.reportId,
				marketId: formState.marketId,
				probability: formState.probability,
				rationale: formState.rationale || null,
			};

			if (editingId !== null) {
				await updateProbability.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(
					t("admin.probabilities.notifications.updated"),
				);
			} else {
				await createProbability.mutateAsync(payload);
				toast.success(
					t("admin.probabilities.notifications.created"),
				);
			}

			queryClient.invalidateQueries({
				queryKey: adminProbabilitiesQueryKey,
			});
			resetForm();
		} catch (error) {
			toast.error(t("admin.probabilities.notifications.error"));
		}
	};

	const handleEdit = (record: (typeof probabilities)[number]) => {
		setEditingId(record.id);
		setFormState({
			reportId: record.reportId,
			marketId: record.marketId,
			probability: record.probability?.toString() ?? "",
			rationale: record.rationale ?? "",
		});
	};

	const handleDelete = (id: number) => {
		confirm({
			title: t("admin.common.confirmDelete.title"),
			message: t("admin.common.confirmDelete.message"),
			confirmLabel: t("admin.common.actions.delete"),
			destructive: true,
			onConfirm: async () => {
				try {
					await deleteProbability.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminProbabilitiesQueryKey,
					});
					toast.success(
						t("admin.probabilities.notifications.deleted"),
					);
				} catch {
					toast.error(
						t("admin.probabilities.notifications.error"),
					);
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.probabilities.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{(["reportId", "marketId", "probability"] as const).map(
								(field) => (
									<div className="space-y-1" key={field}>
										<label className="text-sm font-medium">
											{t(
												`admin.probabilities.fields.${field}`,
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

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.probabilities.fields.rationale")}
							</label>
							<Textarea
								value={formState.rationale}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										rationale: e.target.value,
									}))
								}
								rows={3}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createProbability.isPending ||
									updateProbability.isPending
								}
							>
								{editingId !== null
									? t("admin.common.actions.update")
									: t("admin.common.actions.create")}
							</Button>
							{editingId !== null && (
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
					<CardTitle>{t("admin.probabilities.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t(
								"admin.probabilities.searchPlaceholder",
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
										{t(
											"admin.probabilities.fields.reportId",
										)}
									</TableHead>
									<TableHead>
										{t(
											"admin.probabilities.fields.marketId",
										)}
									</TableHead>
									<TableHead>
										{t(
											"admin.probabilities.fields.probability",
										)}
									</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={4}>
											<div className="flex items-center gap-2">
												<Spinner className="size-4" />
												{t("admin.common.state.loading")}
											</div>
										</TableCell>
									</TableRow>
								) : probabilities.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									probabilities.map((record) => (
										<TableRow key={record.id}>
											<TableCell>{record.id}</TableCell>
											<TableCell className="font-mono text-xs">
												{record.reportId}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{record.marketId}
											</TableCell>
											<TableCell>
												{record.probability?.toString()}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(record)
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
														handleDelete(record.id)
													}
													loading={
														deleteProbability.isPending
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
