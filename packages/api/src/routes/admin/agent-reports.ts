import {
	countAdminAgentReports,
	createAdminAgentReport,
	deleteAdminAgentReport,
	getAdminAgentReportById,
	getAdminAgentReports,
	updateAdminAgentReport,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import {
	toOptionalDecimal,
	toRequiredDate,
} from "./utils";

const agentReportBodySchema = z.object({
	agentId: z.string().trim(),
	eventId: z.string().trim(),
	reportDate: z.string().trim(),
	headline: z.string().trim().nullable().optional(),
	summary: z.string().trim().nullable().optional(),
	rawOutput: z.unknown().optional(),
	confidence: z.string().trim().nullable().optional(),
});

export const agentReportRouter = new Hono()
	.basePath("/agent-reports")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				agentId: z.string().optional(),
				eventId: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List agent reports",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, agentId, eventId, limit, offset } =
				c.req.valid("query");

			const reports = await getAdminAgentReports({
				limit,
				offset,
				query,
				agentId,
				eventId,
			});
			const total = await countAdminAgentReports({
				query,
				agentId,
				eventId,
			});

			return c.json({ reports, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const report = await getAdminAgentReportById(id);

		if (!report) {
			throw new HTTPException(404);
		}

		return c.json({ report });
	})
	.post(
		"/",
		validator("json", agentReportBodySchema),
		async (c) => {
			const body = c.req.valid("json");

			const report = await createAdminAgentReport({
				agentId: body.agentId,
				eventId: body.eventId,
				reportDate: toRequiredDate(body.reportDate),
				headline: body.headline ?? undefined,
				summary: body.summary ?? undefined,
				rawOutput: body.rawOutput ?? undefined,
				confidence:
					toOptionalDecimal(body.confidence ?? undefined) ?? undefined,
			});

			return c.json({ report });
		},
	)
	.put(
		"/:id",
		validator("json", agentReportBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = c.req.param("id");

			const report = await updateAdminAgentReport(id, {
				agentId: body.agentId,
				eventId: body.eventId,
				reportDate: toRequiredDate(body.reportDate),
				headline: body.headline ?? null,
				summary: body.summary ?? null,
				rawOutput: body.rawOutput ?? null,
				confidence: toOptionalDecimal(body.confidence ?? undefined),
			});

			return c.json({ report });
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await deleteAdminAgentReport(id);
		return c.json({ success: true });
	});
