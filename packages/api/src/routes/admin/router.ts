import { Hono } from "hono";
import { agentOrderRouter } from "./agent-orders";
import { agentReportProbabilityRouter } from "./agent-report-probabilities";
import { agentReportRouter } from "./agent-reports";
import { agentRouter } from "./agents";
import { eventRouter } from "./events";
import { marketRouter } from "./markets";
import { organizationRouter } from "./organizations";
import { userInvestmentRouter } from "./user-investments";
import { userRouter } from "./users";

export const adminRouter = new Hono()
	.basePath("/admin")
	.route("/", organizationRouter)
	.route("/", userRouter)
	.route("/", eventRouter)
	.route("/", marketRouter)
	.route("/", agentRouter)
	.route("/", agentReportRouter)
	.route("/", agentReportProbabilityRouter)
	.route("/", agentOrderRouter)
	.route("/", userInvestmentRouter);
