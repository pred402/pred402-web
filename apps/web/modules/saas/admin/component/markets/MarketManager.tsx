"use client";

import {
	adminMarketsQueryKey,
	useAdminMarketsQuery,
	useCreateAdminMarketMutation,
	useDeleteAdminMarketMutation,
	useUpdateAdminMarketMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
	emptyToUndefined,
	formatDateTimeLocal,
	formatDecimalInput,
	parseJsonField,
	pickFirstTextValue,
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

const DEFAULT_LIMIT = 50;

type MarketFormState = {
	eventId: string;
	slug: string;
	titleJson: string;
	image: string;
	status: string;
	activatedAt: string;
	resolvedAt: string;
	cancelledAt: string;
	totalTradeVolume: string;
};

const defaultFormState: MarketFormState = {
	eventId: "",
	slug: "",
	titleJson: "",
	image: "",
	status: "OPENING",
	activatedAt: "",
	resolvedAt: "",
	cancelledAt: "",
	totalTradeVolume: "",
};

export function MarketManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] =
		useState<MarketFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminMarketsQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createMarket = useCreateAdminMarketMutation();
	const updateMarket = useUpdateAdminMarketMutation();
	const deleteMarket = useDeleteAdminMarketMutation();

	const markets = data?.markets ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				eventId: formState.eventId,
				slug: emptyToUndefined(formState.slug),
				title: parseJsonField(formState.titleJson, {}),
				image: emptyToUndefined(formState.image),
				status: formState.status,
				activatedAt: emptyToNull(formState.activatedAt),
				resolvedAt: emptyToNull(formState.resolvedAt),
				cancelledAt: emptyToNull(formState.cancelledAt),
				totalTradeVolume: emptyToUndefined(formState.totalTradeVolume),
			};

			if (editingId) {
				await updateMarket.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(t("admin.markets.notifications.updated"));
			} else {
				await createMarket.mutateAsync(payload);
				toast.success(t("admin.markets.notifications.created"));
			}

			queryClient.invalidateQueries({ queryKey: adminMarketsQueryKey });
			resetForm();
		} catch (error) {
			if (error instanceof Error && error.message === "INVALID_JSON") {
				toast.error(t("admin.common.messages.jsonError"));
				return;
			}

			toast.error(t("admin.markets.notifications.error"));
		}
	};

	const handleEdit = (market: (typeof markets)[number]) => {
		setEditingId(market.id);
		setFormState({
			eventId: market.eventId,
			slug: market.slug ?? "",
			titleJson: stringifyJsonField(market.title),
			image: market.image ?? "",
			status: market.status ?? "",
			activatedAt: formatDateTimeLocal(market.activatedAt),
			resolvedAt: formatDateTimeLocal(market.resolvedAt),
			cancelledAt: formatDateTimeLocal(market.cancelledAt),
			totalTradeVolume: formatDecimalInput(market.totalTradeVolume),
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
					await deleteMarket.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminMarketsQueryKey,
					});
					toast.success(t("admin.markets.notifications.deleted"));
				} catch {
					toast.error(t("admin.markets.notifications.error"));
				}
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.markets.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.markets.fields.eventId")}
								</label>
								<Input
									value={formState.eventId}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											eventId: e.target.value,
										}))
									}
									placeholder="clx..."
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.markets.fields.slug")}
								</label>
								<Input
									value={formState.slug}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											slug: e.target.value,
										}))
									}
									placeholder="market-identifier"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{(["status", "activatedAt", "resolvedAt"] as const).map(
								(field) => (
									<div className="space-y-1" key={field}>
										<label className="text-sm font-medium">
											{t(`admin.markets.fields.${field}`)}
										</label>
										<Input
											type={
												field === "status"
													? "text"
													: "datetime-local"
											}
											value={formState[field]}
											onChange={(e) =>
												setFormState((prev) => ({
													...prev,
													[field]: e.target.value,
												}))
											}
											placeholder={
												field === "status"
													? "OPENING"
													: undefined
											}
										/>
									</div>
								),
							)}
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.markets.fields.cancelledAt")}
								</label>
								<Input
									type="datetime-local"
									value={formState.cancelledAt}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											cancelledAt: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.markets.fields.totalTradeVolume")}
								</label>
								<Input
									value={formState.totalTradeVolume}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											totalTradeVolume: e.target.value,
										}))
									}
									placeholder="0"
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.markets.fields.image")}
								</label>
								<Input
									value={formState.image}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											image: e.target.value,
										}))
									}
									placeholder="https://..."
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.markets.fields.title")}
							</label>
							<Textarea
								value={formState.titleJson}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										titleJson: e.target.value,
									}))
								}
								rows={4}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createMarket.isPending ||
									updateMarket.isPending
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
					<CardTitle>{t("admin.markets.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t("admin.markets.searchPlaceholder")}
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
										{t("admin.markets.fields.slug")}
									</TableHead>
									<TableHead>
										{t("admin.markets.fields.eventId")}
									</TableHead>
									<TableHead>
										{t("admin.markets.fields.status")}
									</TableHead>
									<TableHead>
										{t("admin.markets.fields.title")}
									</TableHead>
									<TableHead>
										{t(
											"admin.markets.fields.totalTradeVolume",
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
								) : markets.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									markets.map((market) => (
										<TableRow key={market.id}>
											<TableCell className="font-mono text-xs">
												{market.id}
											</TableCell>
											<TableCell>{market.slug}</TableCell>
											<TableCell className="font-mono text-xs">
												{market.event?.slug ??
													market.eventId}
											</TableCell>
											<TableCell>{market.status}</TableCell>
											<TableCell>
												{pickFirstTextValue(
													market.title,
												) ||
													t(
														"admin.common.labels.unknown",
													)}
											</TableCell>
											<TableCell>
												{formatDecimalInput(
													market.totalTradeVolume,
												)}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(market)
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
														handleDelete(market.id)
													}
													loading={
														deleteMarket.isPending
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
