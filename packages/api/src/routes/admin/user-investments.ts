import {
	countAdminUserInvestments,
	createAdminUserInvestment,
	deleteAdminUserInvestment,
	getAdminUserInvestmentById,
	getAdminUserInvestments,
	updateAdminUserInvestment,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import { toDecimal, toOptionalDecimal } from "./utils";

const userInvestmentBodySchema = z.object({
	userId: z.string().trim(),
	agentId: z.string().trim(),
	eventId: z.string().trim(),
	marketId: z.string().trim(),
	agentOrderId: z.string().trim().nullable().optional(),
	amount: z.string().trim(),
	currency: z.string().trim(),
	status: z.string().trim(),
	txHash: z.string().trim().nullable().optional(),
	expectedRoiPct: z.string().trim().nullable().optional(),
	settledPnl: z.string().trim().nullable().optional(),
	notes: z.string().trim().nullable().optional(),
});

export const userInvestmentRouter = new Hono()
	.basePath("/user-investments")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				userId: z.string().optional(),
				agentId: z.string().optional(),
				eventId: z.string().optional(),
				marketId: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List user investments",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, userId, agentId, eventId, marketId, limit, offset } =
				c.req.valid("query");

			const investments = await getAdminUserInvestments({
				limit,
				offset,
				query,
				userId,
				agentId,
				eventId,
				marketId,
			});
			const total = await countAdminUserInvestments({
				query,
				userId,
				agentId,
				eventId,
				marketId,
			});

			return c.json({ investments, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const investment = await getAdminUserInvestmentById(id);

		if (!investment) {
			throw new HTTPException(404);
		}

		return c.json({ investment });
	})
	.post(
		"/",
		validator("json", userInvestmentBodySchema),
		async (c) => {
			const body = c.req.valid("json");

			const investment = await createAdminUserInvestment({
				userId: body.userId,
				agentId: body.agentId,
				eventId: body.eventId,
				marketId: body.marketId,
				agentOrderId: body.agentOrderId ?? undefined,
				amount: toDecimal(body.amount),
				currency: body.currency,
				status: body.status,
				txHash: body.txHash ?? undefined,
				expectedRoiPct: toOptionalDecimal(body.expectedRoiPct),
				settledPnl: toOptionalDecimal(body.settledPnl),
				notes: body.notes ?? undefined,
			});

			return c.json({ investment });
		},
	)
	.put(
		"/:id",
		validator("json", userInvestmentBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const investment = await updateAdminUserInvestment(id, {
				userId: body.userId,
				agentId: body.agentId,
				eventId: body.eventId,
				marketId: body.marketId,
				agentOrderId: body.agentOrderId ?? null,
				amount: toDecimal(body.amount),
				currency: body.currency,
				status: body.status,
				txHash: body.txHash ?? null,
				expectedRoiPct: toOptionalDecimal(body.expectedRoiPct),
				settledPnl: toOptionalDecimal(body.settledPnl),
				notes: body.notes ?? null,
			});

			return c.json({ investment });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminUserInvestment(id);
		return c.json({ success: true });
	});
