"use client";

import {
	adminAgentReportsQueryKey,
	useAdminAgentReportsQuery,
	useCreateAdminAgentReportMutation,
	useDeleteAdminAgentReportMutation,
	useUpdateAdminAgentReportMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
	formatDateTimeLocal,
	parseJsonField,
	stringifyJsonField,
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

type ReportFormState = {
	agentId: string;
	eventId: string;
	reportDate: string;
	headline: string;
	summary: string;
	rawOutput: string;
	confidence: string;
};

const defaultFormState: ReportFormState = {
	agentId: "",
	eventId: "",
	reportDate: "",
	headline: "",
	summary: "",
	rawOutput: "",
	confidence: "",
};

export function AgentReportManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] =
		useState<ReportFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminAgentReportsQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createReport = useCreateAdminAgentReportMutation();
	const updateReport = useUpdateAdminAgentReportMutation();
	const deleteReport = useDeleteAdminAgentReportMutation();

	const reports = data?.reports ?? [];

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
				reportDate: formState.reportDate,
				headline: emptyToNull(formState.headline),
				summary: emptyToNull(formState.summary),
				rawOutput: parseJsonField(formState.rawOutput, {}),
				confidence: emptyToNull(formState.confidence),
			};

			if (editingId) {
				await updateReport.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(t("admin.agentReports.notifications.updated"));
			} else {
				await createReport.mutateAsync(payload);
				toast.success(t("admin.agentReports.notifications.created"));
			}

			queryClient.invalidateQueries({
				queryKey: adminAgentReportsQueryKey,
			});
			resetForm();
		} catch (error) {
			if (error instanceof Error && error.message === "INVALID_JSON") {
				toast.error(t("admin.common.messages.jsonError"));
				return;
			}

			toast.error(t("admin.agentReports.notifications.error"));
		}
	};

	const handleEdit = (report: (typeof reports)[number]) => {
		setEditingId(report.id);
		setFormState({
			agentId: report.agentId,
			eventId: report.eventId,
			reportDate: formatDateTimeLocal(report.reportDate),
			headline: report.headline ?? "",
			summary: report.summary ?? "",
			rawOutput: stringifyJsonField(report.rawOutput),
			confidence: report.confidence?.toString() ?? "",
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
					await deleteReport.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminAgentReportsQueryKey,
					});
					toast.success(t("admin.agentReports.notifications.deleted"));
				} catch {
					toast.error(t("admin.agentReports.notifications.error"));
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.agentReports.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{(["agentId", "eventId", "reportDate"] as const).map(
								(field) => (
									<div className="space-y-1" key={field}>
										<label className="text-sm font-medium">
											{t(
												`admin.agentReports.fields.${field}`,
											)}
										</label>
										<Input
											type={
												field === "reportDate"
													? "datetime-local"
													: "text"
											}
											value={formState[field]}
											onChange={(e) =>
												setFormState((prev) => ({
													...prev,
													[field]: e.target.value,
												}))
											}
											required={field !== "reportDate"}
										/>
									</div>
								),
							)}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentReports.fields.headline")}
								</label>
								<Input
									value={formState.headline}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											headline: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.agentReports.fields.confidence")}
								</label>
								<Input
									value={formState.confidence}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											confidence: e.target.value,
										}))
									}
									placeholder="85.5"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.agentReports.fields.summary")}
							</label>
							<Textarea
								value={formState.summary}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										summary: e.target.value,
									}))
								}
								rows={3}
							/>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.agentReports.fields.rawOutput")}
							</label>
							<Textarea
								value={formState.rawOutput}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										rawOutput: e.target.value,
									}))
								}
								rows={4}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createReport.isPending ||
									updateReport.isPending
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
					<CardTitle>{t("admin.agentReports.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t(
								"admin.agentReports.searchPlaceholder",
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
										{t("admin.agentReports.fields.agentId")}
									</TableHead>
									<TableHead>
										{t("admin.agentReports.fields.eventId")}
									</TableHead>
									<TableHead>
										{t(
											"admin.agentReports.fields.reportDate",
										)}
									</TableHead>
									<TableHead>
										{t("admin.agentReports.fields.confidence")}
									</TableHead>
									<TableHead>{t("admin.agentReports.fields.markets")}</TableHead>
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
								) : reports.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									reports.map((report) => (
										<TableRow key={report.id}>
											<TableCell className="font-mono text-xs">
												{report.id}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{report.agent?.slug ??
													report.agentId}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{report.event?.slug ??
													report.eventId}
											</TableCell>
											<TableCell>
												{new Date(
													report.reportDate,
												).toLocaleString()}
											</TableCell>
											<TableCell>
												{report.confidence?.toString() ??
													"—"}
											</TableCell>
											<TableCell>
												{report.markets.length}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(report)
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
														handleDelete(report.id)
													}
													loading={
														deleteReport.isPending
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
