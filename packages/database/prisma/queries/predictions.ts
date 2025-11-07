import type { Prisma } from "@prisma/client";
import { db } from "../client";

const ilike = (value?: string) =>
	value
		? {
				contains: value,
				mode: "insensitive" as const,
			}
		: undefined;

/*
 * Events
 */
export async function getAdminEvents({
	limit,
	offset,
	query,
	status,
}: {
	limit: number;
	offset: number;
	query?: string;
	status?: string;
}) {
	const where: Prisma.EventWhereInput = {
		...(status ? { status } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ category: ilike(query) },
					],
			  }
			: {}),
	};

	const events = await db.event.findMany({
		where,
		include: {
			_count: {
				select: {
					markets: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});

	return events.map((event) => ({
		...event,
		marketCount: event._count.markets,
	}));
}

export async function countAdminEvents({
	query,
	status,
}: {
	query?: string;
	status?: string;
}) {
	const where: Prisma.EventWhereInput = {
		...(status ? { status } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ category: ilike(query) },
					],
			  }
			: {}),
	};

	return db.event.count({
		where,
	});
}

export async function getAdminEventById(id: string) {
	return db.event.findUnique({
		where: { id },
		include: {
			markets: true,
			agentReports: true,
			agentOrders: true,
		},
	});
}

export async function createAdminEvent(data: Prisma.EventCreateInput) {
	return db.event.create({
		data,
	});
}

export async function updateAdminEvent(
	id: string,
	data: Prisma.EventUpdateInput,
) {
	return db.event.update({
		where: { id },
		data,
	});
}

export async function deleteAdminEvent(id: string) {
	return db.event.delete({
		where: { id },
	});
}

/*
 * Markets
 */
export async function getAdminMarkets({
	limit,
	offset,
	query,
	eventId,
}: {
	limit: number;
	offset: number;
	query?: string;
	eventId?: string;
}) {
	const where: Prisma.MarketWhereInput = {
		...(eventId ? { eventId } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ status: ilike(query) },
					],
			  }
			: {}),
	};

	return db.market.findMany({
		where,
		include: {
			event: {
				select: {
					id: true,
					slug: true,
					title: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});
}

export async function countAdminMarkets({
	query,
	eventId,
}: {
	query?: string;
	eventId?: string;
}) {
	const where: Prisma.MarketWhereInput = {
		...(eventId ? { eventId } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ status: ilike(query) },
					],
			  }
			: {}),
	};

	return db.market.count({
		where,
	});
}

export async function getAdminMarketById(id: string) {
	return db.market.findUnique({
		where: { id },
		include: {
			event: true,
		},
	});
}

export async function createAdminMarket(
	data: Prisma.MarketUncheckedCreateInput,
) {
	return db.market.create({
		data,
	});
}

export async function updateAdminMarket(
	id: string,
	data: Prisma.MarketUncheckedUpdateInput,
) {
	return db.market.update({
		where: { id },
		data,
	});
}

export async function deleteAdminMarket(id: string) {
	return db.market.delete({
		where: { id },
	});
}

/*
 * Agents
 */
export async function getAdminAgents({
	limit,
	offset,
	query,
	isActive,
}: {
	limit: number;
	offset: number;
	query?: string;
	isActive?: boolean;
}) {
	const where: Prisma.AgentWhereInput = {
		...(typeof isActive === "boolean" ? { isActive } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ name: ilike(query) },
						{ modelName: ilike(query) },
						{ modelVendor: ilike(query) },
					],
			  }
			: {}),
	};

	const agents = await db.agent.findMany({
		where,
		include: {
			_count: {
				select: {
					reports: true,
					orders: true,
					userInvestments: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});

	return agents.map((agent) => ({
		...agent,
		reportsCount: agent._count.reports,
		ordersCount: agent._count.orders,
		investmentsCount: agent._count.userInvestments,
	}));
}

export async function countAdminAgents({
	query,
	isActive,
}: {
	query?: string;
	isActive?: boolean;
}) {
	const where: Prisma.AgentWhereInput = {
		...(typeof isActive === "boolean" ? { isActive } : {}),
		...(query
			? {
					OR: [
						{ slug: ilike(query) },
						{ name: ilike(query) },
						{ modelName: ilike(query) },
						{ modelVendor: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agent.count({
		where,
	});
}

export async function getAdminAgentById(id: string) {
	return db.agent.findUnique({
		where: { id },
		include: {
			reports: true,
			orders: true,
		},
	});
}

export async function createAdminAgent(data: Prisma.AgentCreateInput) {
	return db.agent.create({
		data,
	});
}

export async function updateAdminAgent(
	id: string,
	data: Prisma.AgentUpdateInput,
) {
	return db.agent.update({
		where: { id },
		data,
	});
}

export async function deleteAdminAgent(id: string) {
	return db.agent.delete({
		where: { id },
	});
}

/*
 * Agent reports
 */
export async function getAdminAgentReports({
	limit,
	offset,
	query,
	agentId,
	eventId,
}: {
	limit: number;
	offset: number;
	query?: string;
	agentId?: string;
	eventId?: string;
}) {
	const where: Prisma.AgentReportWhereInput = {
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(query
			? {
					OR: [
						{ headline: ilike(query) },
						{ summary: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentReport.findMany({
		where,
		include: {
			agent: true,
			event: true,
			markets: true,
		},
		orderBy: {
			reportDate: "desc",
		},
		skip: offset,
		take: limit,
	});
}

export async function countAdminAgentReports({
	query,
	agentId,
	eventId,
}: {
	query?: string;
	agentId?: string;
	eventId?: string;
}) {
	const where: Prisma.AgentReportWhereInput = {
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(query
			? {
					OR: [
						{ headline: ilike(query) },
						{ summary: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentReport.count({
		where,
	});
}

export async function getAdminAgentReportById(id: string) {
	return db.agentReport.findUnique({
		where: { id },
		include: {
			agent: true,
			event: true,
			markets: true,
		},
	});
}

export async function createAdminAgentReport(
	data: Prisma.AgentReportUncheckedCreateInput,
) {
	return db.agentReport.create({
		data,
	});
}

export async function updateAdminAgentReport(
	id: string,
	data: Prisma.AgentReportUncheckedUpdateInput,
) {
	return db.agentReport.update({
		where: { id },
		data,
	});
}

export async function deleteAdminAgentReport(id: string) {
	return db.agentReport.delete({
		where: { id },
	});
}

/*
 * Agent report market probabilities
 */
export async function getAdminReportProbabilities({
	limit,
	offset,
	query,
	reportId,
	marketId,
}: {
	limit: number;
	offset: number;
	query?: string;
	reportId?: string;
	marketId?: string;
}) {
	const where: Prisma.AgentReportMarketProbabilityWhereInput = {
		...(reportId ? { reportId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ rationale: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentReportMarketProbability.findMany({
		where,
		include: {
			report: {
				include: {
					agent: true,
					event: true,
				},
			},
			market: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});
}

export async function countAdminReportProbabilities({
	query,
	reportId,
	marketId,
}: {
	query?: string;
	reportId?: string;
	marketId?: string;
}) {
	const where: Prisma.AgentReportMarketProbabilityWhereInput = {
		...(reportId ? { reportId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ rationale: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentReportMarketProbability.count({
		where,
	});
}

export async function getAdminReportProbabilityById(id: number) {
	return db.agentReportMarketProbability.findUnique({
		where: { id },
		include: {
			report: true,
			market: true,
		},
	});
}

export async function createAdminReportProbability(
	data: Prisma.AgentReportMarketProbabilityUncheckedCreateInput,
) {
	return db.agentReportMarketProbability.create({
		data,
	});
}

export async function updateAdminReportProbability(
	id: number,
	data: Prisma.AgentReportMarketProbabilityUncheckedUpdateInput,
) {
	return db.agentReportMarketProbability.update({
		where: { id },
		data,
	});
}

export async function deleteAdminReportProbability(id: number) {
	return db.agentReportMarketProbability.delete({
		where: { id },
	});
}

/*
 * Agent orders
 */
export async function getAdminAgentOrders({
	limit,
	offset,
	query,
	agentId,
	eventId,
	marketId,
}: {
	limit: number;
	offset: number;
	query?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
}) {
	const where: Prisma.AgentOrderWhereInput = {
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ status: ilike(query) },
						{ stakeCurrency: ilike(query) },
						{ notes: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentOrder.findMany({
		where,
		include: {
			agent: true,
			event: true,
			market: true,
			report: true,
			createdBy: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});
}

export async function countAdminAgentOrders({
	query,
	agentId,
	eventId,
	marketId,
}: {
	query?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
}) {
	const where: Prisma.AgentOrderWhereInput = {
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ status: ilike(query) },
						{ stakeCurrency: ilike(query) },
						{ notes: ilike(query) },
					],
			  }
			: {}),
	};

	return db.agentOrder.count({
		where,
	});
}

export async function getAdminAgentOrderById(id: string) {
	return db.agentOrder.findUnique({
		where: { id },
		include: {
			agent: true,
			event: true,
			market: true,
			report: true,
			createdBy: true,
		},
	});
}

export async function createAdminAgentOrder(
	data: Prisma.AgentOrderUncheckedCreateInput,
) {
	return db.agentOrder.create({
		data,
	});
}

export async function updateAdminAgentOrder(
	id: string,
	data: Prisma.AgentOrderUncheckedUpdateInput,
) {
	return db.agentOrder.update({
		where: { id },
		data,
	});
}

export async function deleteAdminAgentOrder(id: string) {
	return db.agentOrder.delete({
		where: { id },
	});
}

/*
 * User investments
 */
export async function getAdminUserInvestments({
	limit,
	offset,
	query,
	userId,
	agentId,
	eventId,
	marketId,
}: {
	limit: number;
	offset: number;
	query?: string;
	userId?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
}) {
	const where: Prisma.UserInvestmentWhereInput = {
		...(userId ? { userId } : {}),
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ status: ilike(query) },
						{ currency: ilike(query) },
						{ notes: ilike(query) },
					],
			  }
			: {}),
	};

	return db.userInvestment.findMany({
		where,
		include: {
			user: true,
			agent: true,
			event: true,
			market: true,
			agentOrder: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: offset,
		take: limit,
	});
}

export async function countAdminUserInvestments({
	query,
	userId,
	agentId,
	eventId,
	marketId,
}: {
	query?: string;
	userId?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
}) {
	const where: Prisma.UserInvestmentWhereInput = {
		...(userId ? { userId } : {}),
		...(agentId ? { agentId } : {}),
		...(eventId ? { eventId } : {}),
		...(marketId ? { marketId } : {}),
		...(query
			? {
					OR: [
						{ status: ilike(query) },
						{ currency: ilike(query) },
						{ notes: ilike(query) },
					],
			  }
			: {}),
	};

	return db.userInvestment.count({
		where,
	});
}

export async function getAdminUserInvestmentById(id: string) {
	return db.userInvestment.findUnique({
		where: { id },
		include: {
			user: true,
			agent: true,
			event: true,
			market: true,
			agentOrder: true,
		},
	});
}

export async function createAdminUserInvestment(
	data: Prisma.UserInvestmentUncheckedCreateInput,
) {
	return db.userInvestment.create({
		data,
	});
}

export async function updateAdminUserInvestment(
	id: string,
	data: Prisma.UserInvestmentUncheckedUpdateInput,
) {
	return db.userInvestment.update({
		where: { id },
		data,
	});
}

export async function deleteAdminUserInvestment(id: string) {
	return db.userInvestment.delete({
		where: { id },
	});
}

/*
 * Homepage - Latest Event with Agent Predictions
 */
export async function getLatestEventWithAgentPredictions() {
	// 获取最新的激活事件
	const latestEvent = await db.event.findFirst({
		where: {
			status: "ACTIVE",
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			markets: {
				where: {
					status: "OPENING",
				},
			},
		},
	});

	if (!latestEvent) {
		return null;
	}

	// 获取该事件的所有 agent 报告（最多 5 个 agent）
	const agentReports = await db.agentReport.findMany({
		where: {
			eventId: latestEvent.id,
		},
		include: {
			agent: true,
			markets: {
				include: {
					market: true,
				},
				where: {
					probability: {
						gte: 15, // 概率大于等于 15%
					},
				},
			},
		},
		orderBy: {
			reportDate: "desc",
		},
		take: 5,
	});

	// 统计每个 agent 的投资数据
	const agentStats = await Promise.all(
		agentReports.map(async (report) => {
			const [totalInvestors, totalInvestmentAmount] = await Promise.all([
				db.userInvestment.count({
					where: {
						agentId: report.agentId,
						eventId: latestEvent.id,
					},
				}),
				db.userInvestment.aggregate({
					where: {
						agentId: report.agentId,
						eventId: latestEvent.id,
					},
					_sum: {
						amount: true,
					},
				}),
			]);

			return {
				agentId: report.agentId,
				totalInvestors,
				totalInvestmentAmount: totalInvestmentAmount._sum.amount || 0,
			};
		}),
	);

	return {
		event: latestEvent,
		agentReports: agentReports.map((report) => {
			const stats = agentStats.find((s) => s.agentId === report.agentId);
			return {
				...report,
				stats: stats || {
					totalInvestors: 0,
					totalInvestmentAmount: 0,
				},
			};
		}),
	};
}
