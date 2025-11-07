import {
	countAdminAgents,
	createAdminAgent,
	deleteAdminAgent,
	getAdminAgentById,
	getAdminAgents,
	updateAdminAgent,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";

const agentBodySchema = z.object({
	slug: z.string().trim(),
	name: z.string().trim(),
	description: z.string().trim().nullable().optional(),
	avatarUrl: z.string().trim().nullable().optional(),
	modelVendor: z.string().trim(),
	modelName: z.string().trim(),
	isActive: z.boolean().optional(),
	metadata: z.record(z.any()).nullable().optional(),
});

export const agentRouter = new Hono()
	.basePath("/agents")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				isActive: z
					.string()
					.optional()
					.transform((value) =>
						value === undefined ? undefined : value === "true",
					),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List agents",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, limit, offset, isActive } = c.req.valid("query");
			const agents = await getAdminAgents({
				limit,
				offset,
				query,
				isActive,
			});
			const total = await countAdminAgents({ query, isActive });

			return c.json({ agents, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const agent = await getAdminAgentById(id);

		if (!agent) {
			throw new HTTPException(404);
		}

		return c.json({ agent });
	})
	.post(
		"/",
		validator("json", agentBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const agent = await createAdminAgent({
				slug: body.slug,
				name: body.name,
				description: body.description ?? undefined,
				avatarUrl: body.avatarUrl ?? undefined,
				modelVendor: body.modelVendor,
				modelName: body.modelName,
				isActive: body.isActive ?? true,
				metadata: body.metadata ?? undefined,
			});

			return c.json({ agent });
		},
	)
	.put(
		"/:id",
		validator("json", agentBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const agent = await updateAdminAgent(id, {
				slug: body.slug,
				name: body.name,
				description: body.description ?? null,
				avatarUrl: body.avatarUrl ?? null,
				modelVendor: body.modelVendor,
				modelName: body.modelName,
				isActive: body.isActive ?? true,
				metadata: body.metadata ?? null,
			});

			return c.json({ agent });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminAgent(id);
		return c.json({ success: true });
	});
