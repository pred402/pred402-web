"use client";

import {
	adminEventsQueryKey,
	useAdminEventsQuery,
	useCreateAdminEventMutation,
	useDeleteAdminEventMutation,
	useUpdateAdminEventMutation,
} from "@saas/admin/lib/api";
import {
	emptyToNull,
	emptyToUndefined,
	formatDateTimeLocal,
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

type EventFormState = {
	slug: string;
	titleJson: string;
	category: string;
	rulesJson: string;
	image: string;
	plannedEndAt: string;
	activatedAt: string;
	resolvedAt: string;
	status: string;
};

const defaultFormState: EventFormState = {
	slug: "",
	titleJson: "",
	category: "",
	rulesJson: "",
	image: "",
	plannedEndAt: "",
	activatedAt: "",
	resolvedAt: "",
	status: "",
};

export function EventManager() {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const [search, setSearch] = useState("");
	const [formState, setFormState] = useState<EventFormState>(defaultFormState);
	const [editingId, setEditingId] = useState<string | null>(null);

	const { data, isLoading } = useAdminEventsQuery({
		limit: DEFAULT_LIMIT,
		offset: 0,
		query: search || undefined,
	});

	const createEvent = useCreateAdminEventMutation();
	const updateEvent = useUpdateAdminEventMutation();
	const deleteEvent = useDeleteAdminEventMutation();

	const events = data?.events ?? [];

	const resetForm = () => {
		setFormState(defaultFormState);
		setEditingId(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const payload = {
				slug: emptyToUndefined(formState.slug),
				title: parseJsonField(formState.titleJson, {}),
				category: formState.category,
				rules: parseJsonField(formState.rulesJson, {}),
				image: emptyToUndefined(formState.image),
				plannedEndAt: emptyToNull(formState.plannedEndAt),
				activatedAt: emptyToNull(formState.activatedAt),
				resolvedAt: emptyToNull(formState.resolvedAt),
				status: formState.status,
			};

			if (editingId) {
				await updateEvent.mutateAsync({
					id: editingId,
					...payload,
				});
				toast.success(t("admin.events.notifications.updated"));
			} else {
				await createEvent.mutateAsync(payload);
				toast.success(t("admin.events.notifications.created"));
			}

			queryClient.invalidateQueries({ queryKey: adminEventsQueryKey });
			resetForm();
		} catch (error) {
			if (error instanceof Error && error.message === "INVALID_JSON") {
				toast.error(t("admin.common.messages.jsonError"));
				return;
			}

			toast.error(t("admin.events.notifications.error"));
		}
	};

	const handleEdit = (eventItem: (typeof events)[number]) => {
		setEditingId(eventItem.id);
		setFormState({
			slug: eventItem.slug ?? "",
			titleJson: stringifyJsonField(eventItem.title),
			category: eventItem.category ?? "",
			rulesJson: stringifyJsonField(eventItem.rules),
			image: eventItem.image ?? "",
			plannedEndAt: formatDateTimeLocal(eventItem.plannedEndAt),
			activatedAt: formatDateTimeLocal(eventItem.activatedAt),
			resolvedAt: formatDateTimeLocal(eventItem.resolvedAt),
			status: eventItem.status ?? "",
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
					await deleteEvent.mutateAsync(id);
					queryClient.invalidateQueries({
						queryKey: adminEventsQueryKey,
					});
					toast.success(t("admin.events.notifications.deleted"));
				} catch {
					toast.error(t("admin.events.notifications.error"));
				}
			},
		});
	};

	const renderTitle = (value: unknown) => {
		return pickFirstTextValue(value) || t("admin.common.labels.unknown");
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.events.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.slug")}
								</label>
								<Input
									value={formState.slug}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											slug: e.target.value,
										}))
									}
									placeholder="event-identifier"
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.category")}
								</label>
								<Input
									value={formState.category}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											category: e.target.value,
										}))
									}
									placeholder="Politics"
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.status")}
								</label>
								<Input
									value={formState.status}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											status: e.target.value,
										}))
									}
									placeholder="ACTIVE"
									required
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.image")}
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

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.plannedEndAt")}
								</label>
								<Input
									type="datetime-local"
									value={formState.plannedEndAt}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											plannedEndAt: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.activatedAt")}
								</label>
								<Input
									type="datetime-local"
									value={formState.activatedAt}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											activatedAt: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium">
									{t("admin.events.fields.resolvedAt")}
								</label>
								<Input
									type="datetime-local"
									value={formState.resolvedAt}
									onChange={(e) =>
										setFormState((prev) => ({
											...prev,
											resolvedAt: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.events.fields.title")}
							</label>
							<Textarea
								value={formState.titleJson}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										titleJson: e.target.value,
									}))
								}
								placeholder='{"en":"Headline"}'
								rows={4}
							/>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">
								{t("admin.events.fields.rules")}
							</label>
							<Textarea
								value={formState.rulesJson}
								onChange={(e) =>
									setFormState((prev) => ({
										...prev,
										rulesJson: e.target.value,
									}))
								}
								placeholder='{"summary":"..."}'
								rows={4}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								loading={
									createEvent.isPending ||
									updateEvent.isPending
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
					<CardTitle>{t("admin.events.tableTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder={t("admin.events.searchPlaceholder")}
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
										{t("admin.events.fields.slug")}
									</TableHead>
									<TableHead>
										{t("admin.events.fields.category")}
									</TableHead>
									<TableHead>
										{t("admin.events.fields.status")}
									</TableHead>
									<TableHead>
										{t("admin.events.fields.title")}
									</TableHead>
									<TableHead>
										{t("admin.events.fields.updatedAt")}
									</TableHead>
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
								) : events.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7}>
											{t("admin.common.state.empty")}
										</TableCell>
									</TableRow>
								) : (
									events.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-mono text-xs">
												{item.id}
											</TableCell>
											<TableCell>{item.slug}</TableCell>
											<TableCell>
												{item.category}
											</TableCell>
											<TableCell>{item.status}</TableCell>
											<TableCell>
												{renderTitle(item.title)}
											</TableCell>
											<TableCell>
												{new Date(
													item.updatedAt,
												).toLocaleString()}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEdit(item)
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
														handleDelete(item.id)
													}
													loading={
														deleteEvent.isPending
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
