import {
	countAdminEvents,
	createAdminEvent,
	deleteAdminEvent,
	getAdminEventById,
	getAdminEvents,
	updateAdminEvent,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import { toOptionalDate } from "./utils";

const eventBodySchema = z.object({
	slug: z.string().trim().optional(),
	title: z.record(z.any()).default({}),
	category: z.string().trim(),
	rules: z.record(z.any()).default({}),
	image: z.string().trim().nullable().optional(),
	plannedEndAt: z.string().trim().nullable().optional(),
	activatedAt: z.string().trim().nullable().optional(),
	resolvedAt: z.string().trim().nullable().optional(),
	status: z.string().trim(),
});

export const eventRouter = new Hono()
	.basePath("/events")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				status: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List events",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, limit, offset, status } = c.req.valid("query");

			const events = await getAdminEvents({
				limit,
				offset,
				query,
				status,
			});
			const total = await countAdminEvents({ query, status });

			return c.json({ events, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const event = await getAdminEventById(id);

		if (!event) {
			throw new HTTPException(404);
		}

		return c.json({ event });
	})
	.post(
		"/",
		validator("json", eventBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const event = await createAdminEvent({
				slug: body.slug ?? undefined,
				title: body.title,
				category: body.category,
				rules: body.rules,
				image: body.image ?? undefined,
				plannedEndAt: toOptionalDate(body.plannedEndAt),
				activatedAt: toOptionalDate(body.activatedAt),
				resolvedAt: toOptionalDate(body.resolvedAt),
				status: body.status,
			});

			return c.json({ event });
		},
	)
	.put(
		"/:id",
		validator("json", eventBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const event = await updateAdminEvent(id, {
				slug: body.slug ?? undefined,
				title: body.title,
				category: body.category,
				rules: body.rules,
				image: body.image ?? null,
				plannedEndAt: toOptionalDate(body.plannedEndAt),
				activatedAt: toOptionalDate(body.activatedAt),
				resolvedAt: toOptionalDate(body.resolvedAt),
				status: body.status,
			});

			return c.json({ event });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminEvent(id);
		return c.json({ success: true });
	});
