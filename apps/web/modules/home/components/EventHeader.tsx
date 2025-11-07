"use client";

import { useTranslations } from "next-intl";

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

	// 计算剩余时间
	const getTimeRemaining = () => {
		if (!event.plannedEndAt) return null;
		const now = new Date();
		const end = new Date(event.plannedEndAt);
		const diff = end.getTime() - now.getTime();

		if (diff <= 0) return "已结束";

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		return `${days}天${hours.toString().padStart(2, '0')}小时`;
	};

	return (
		<div className="space-y-3">
			{/* 标题 */}
			<h1 className="text-4xl font-bold">{title}</h1>

			{/* 描述文本 */}
			<p className="text-muted-foreground text-base leading-relaxed">
				{rules}
			</p>

			{/* 研判判定和耗时信息 */}
			<div className="flex items-center gap-4 text-sm">
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground">研判判定：</span>
					<span className="font-medium">以研判为准</span>
				</div>
				{event.plannedEndAt && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">耗时间隔：</span>
						<span className="font-medium">{getTimeRemaining()}</span>
					</div>
				)}
			</div>
		</div>
	);
}
