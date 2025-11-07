import { getLatestEventWithAgentPredictions } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

export const homeRouter = new Hono().get(
	"/home/latest-event",
	describeRoute({
		summary: "Get latest event with agent predictions",
		tags: ["Home"],
	}),
	async (c) => {
		const data = await getLatestEventWithAgentPredictions();

		if (!data) {
			return c.json({ event: null, agentReports: [] });
		}

		return c.json(data);
	},
);
