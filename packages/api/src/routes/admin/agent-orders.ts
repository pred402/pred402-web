import {
	countAdminAgentOrders,
	createAdminAgentOrder,
	deleteAdminAgentOrder,
	getAdminAgentOrderById,
	getAdminAgentOrders,
	updateAdminAgentOrder,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import {
	toDecimal,
	toOptionalDate,
	toOptionalDecimal,
} from "./utils";

const agentOrderBodySchema = z.object({
	agentId: z.string().trim(),
	eventId: z.string().trim(),
	marketId: z.string().trim(),
	reportId: z.string().trim().nullable().optional(),
	stakeAmount: z.string().trim(),
	stakeCurrency: z.string().trim(),
	expectedRoiPct: z.string().trim().nullable().optional(),
	status: z.string().trim(),
	notes: z.string().trim().nullable().optional(),
	txHash: z.string().trim().nullable().optional(),
	executedAt: z.string().trim().nullable().optional(),
	createdById: z.string().trim().nullable().optional(),
});

const normalizeCreatedBy = (
	value: string | null | undefined,
	defaultValue?: string,
) => {
	if (value === undefined) {
		return defaultValue;
	}

	if (value === null || value === "") {
		return null;
	}

	return value;
};

export const agentOrderRouter = new Hono()
	.basePath("/agent-orders")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				agentId: z.string().optional(),
				eventId: z.string().optional(),
				marketId: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List agent orders",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, agentId, eventId, marketId, limit, offset } =
				c.req.valid("query");

			const orders = await getAdminAgentOrders({
				limit,
				offset,
				query,
				agentId,
				eventId,
				marketId,
			});
			const total = await countAdminAgentOrders({
				query,
				agentId,
				eventId,
				marketId,
			});

			return c.json({ orders, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const order = await getAdminAgentOrderById(id);

		if (!order) {
			throw new HTTPException(404);
		}

		return c.json({ order });
	})
	.post(
		"/",
		validator("json", agentOrderBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const adminUser = c.get("user");

			const order = await createAdminAgentOrder({
				agentId: body.agentId,
				eventId: body.eventId,
				marketId: body.marketId,
				reportId: body.reportId ?? undefined,
				createdById: normalizeCreatedBy(body.createdById, adminUser.id),
				stakeAmount: toDecimal(body.stakeAmount),
				stakeCurrency: body.stakeCurrency,
				expectedRoiPct: toOptionalDecimal(body.expectedRoiPct),
				status: body.status,
				notes: body.notes ?? undefined,
				txHash: body.txHash ?? undefined,
				executedAt: toOptionalDate(body.executedAt),
			});

			return c.json({ order });
		},
	)
	.put(
		"/:id",
		validator("json", agentOrderBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const order = await updateAdminAgentOrder(id, {
				agentId: body.agentId,
				eventId: body.eventId,
				marketId: body.marketId,
				reportId: body.reportId ?? null,
				createdById: normalizeCreatedBy(body.createdById),
				stakeAmount: toDecimal(body.stakeAmount),
				stakeCurrency: body.stakeCurrency,
				expectedRoiPct: toOptionalDecimal(body.expectedRoiPct),
				status: body.status,
				notes: body.notes ?? null,
				txHash: body.txHash ?? null,
				executedAt: toOptionalDate(body.executedAt),
			});

			return c.json({ order });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminAgentOrder(id);
		return c.json({ success: true });
	});
