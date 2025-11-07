"use client";

import { Card, CardContent, CardHeader } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { useTranslations } from "next-intl";
import Image from "next/image";

type Event = {
	id: string;
	title: Record<string, string>;
	category: string;
	rules: Record<string, string>;
	image?: string | null;
	status: string;
	plannedEndAt?: Date | null;
};

type EventHeaderProps = {
	event: Event;
};

export function EventHeader({ event }: EventHeaderProps) {
	const t = useTranslations();

	// 获取当前语言的标题
	const title = event.title.zh || event.title.en || "未知事件";
	const rules = event.rules.zh || event.rules.en || "";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<Badge>{event.category}</Badge>
							<Badge
								status={event.status === "ACTIVE" ? "success" : "info"}
							>
								{event.status}
							</Badge>
						</div>
						<h1 className="text-3xl font-bold mb-4">{title}</h1>
						{event.image && (
							<div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
								<Image
									src={event.image}
									alt={title}
									fill
									className="object-cover"
								/>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<h3 className="font-semibold mb-2">
							{t("home.event.rules")}
						</h3>
						<p className="text-muted-foreground whitespace-pre-wrap">
							{rules}
						</p>
					</div>
					{event.plannedEndAt && (
						<div>
							<h3 className="font-semibold mb-2">
								{t("home.event.deadline")}
							</h3>
							<p className="text-muted-foreground">
								{new Date(event.plannedEndAt).toLocaleString()}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
