import {
	countAdminMarkets,
	createAdminMarket,
	deleteAdminMarket,
	getAdminMarketById,
	getAdminMarkets,
	updateAdminMarket,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import { toOptionalDate, toOptionalDecimal } from "./utils";

const marketBodySchema = z.object({
	eventId: z.string().trim(),
	slug: z.string().trim().optional(),
	title: z.record(z.any()).default({}),
	image: z.string().trim().nullable().optional(),
	status: z.string().trim(),
	activatedAt: z.string().trim().nullable().optional(),
	resolvedAt: z.string().trim().nullable().optional(),
	cancelledAt: z.string().trim().nullable().optional(),
	totalTradeVolume: z.string().trim().nullable().optional(),
});

export const marketRouter = new Hono()
	.basePath("/markets")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				eventId: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List markets",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, limit, offset, eventId } = c.req.valid("query");

			const markets = await getAdminMarkets({
				limit,
				offset,
				query,
				eventId,
			});
			const total = await countAdminMarkets({ query, eventId });

			return c.json({ markets, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const market = await getAdminMarketById(id);

		if (!market) {
			throw new HTTPException(404);
		}

		return c.json({ market });
	})
	.post(
		"/",
		validator("json", marketBodySchema),
		async (c) => {
			const body = c.req.valid("json");

			const market = await createAdminMarket({
				eventId: body.eventId,
				slug: body.slug ?? undefined,
				title: body.title,
				image: body.image ?? undefined,
				status: body.status,
				activatedAt: toOptionalDate(body.activatedAt),
				resolvedAt: toOptionalDate(body.resolvedAt),
				cancelledAt: toOptionalDate(body.cancelledAt),
				totalTradeVolume: toOptionalDecimal(
					body.totalTradeVolume,
				) ?? undefined,
			});

			return c.json({ market });
		},
	)
	.put(
		"/:id",
		validator("json", marketBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const market = await updateAdminMarket(id, {
				eventId: body.eventId,
				slug: body.slug ?? undefined,
				title: body.title,
				image: body.image ?? null,
				status: body.status,
				activatedAt: toOptionalDate(body.activatedAt),
				resolvedAt: toOptionalDate(body.resolvedAt),
				cancelledAt: toOptionalDate(body.cancelledAt),
				totalTradeVolume:
					toOptionalDecimal(body.totalTradeVolume) ?? undefined,
			});

			return c.json({ market });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminMarket(id);
		return c.json({ success: true });
	});
