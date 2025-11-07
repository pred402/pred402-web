import {
	countAdminReportProbabilities,
	createAdminReportProbability,
	deleteAdminReportProbability,
	getAdminReportProbabilityById,
	getAdminReportProbabilities,
	updateAdminReportProbability,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";
import { toDecimal } from "./utils";

const probabilityBodySchema = z.object({
	reportId: z.string().trim(),
	marketId: z.string().trim(),
	probability: z.string().trim(),
	rationale: z.string().trim().nullable().optional(),
});

const toNumericId = (value: string) => {
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw new HTTPException(400, {
			message: "Invalid identifier",
		});
	}

	return id;
};

export const agentReportProbabilityRouter = new Hono()
	.basePath("/agent-report-probabilities")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				reportId: z.string().optional(),
				marketId: z.string().optional(),
				limit: z.string().optional().default("20").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "List agent report probabilities",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, reportId, marketId, limit, offset } =
				c.req.valid("query");

			const probabilities = await getAdminReportProbabilities({
				limit,
				offset,
				query,
				reportId,
				marketId,
			});
			const total = await countAdminReportProbabilities({
				query,
				reportId,
				marketId,
			});

			return c.json({ probabilities, total });
		},
	)
	.get("/:id", async (c) => {
		const id = toNumericId(c.req.param("id"));
		const probability = await getAdminReportProbabilityById(id);

		if (!probability) {
			throw new HTTPException(404);
		}

		return c.json({ probability });
	})
	.post(
		"/",
		validator("json", probabilityBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const probability = await createAdminReportProbability({
				reportId: body.reportId,
				marketId: body.marketId,
				probability: toDecimal(body.probability),
				rationale: body.rationale ?? undefined,
			});

			return c.json({ probability });
		},
	)
	.put(
		"/:id",
		validator("json", probabilityBodySchema),
		async (c) => {
			const body = c.req.valid("json");
			const id = toNumericId(c.req.param("id"));

			const probability = await updateAdminReportProbability(id, {
				reportId: body.reportId,
				marketId: body.marketId,
				probability: toDecimal(body.probability),
				rationale: body.rationale ?? null,
			});

			return c.json({ probability });
		},
	)
	.delete("/:id", async (c) => {
		const id = toNumericId(c.req.param("id"));
		await deleteAdminReportProbability(id);
		return c.json({ success: true });
	});
