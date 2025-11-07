import { apiClient } from "@shared/lib/api-client";
import { createQueryKeyWithParams } from "@shared/lib/query-client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
} from "@tanstack/react-query";

/*
 * Admin users
 */
type FetchAdminUsersParams = {
	itemsPerPage: number;
	currentPage: number;
	searchTerm: string;
};

export const adminUsersQueryKey = ["admin", "users"];
export const fetchAdminUsers = async ({
	itemsPerPage,
	currentPage,
	searchTerm,
}: FetchAdminUsersParams) => {
	const response = await apiClient.admin.users.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			query: searchTerm,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch users");
	}

	return response.json();
};
export const useAdminUsersQuery = (params: FetchAdminUsersParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminUsersQueryKey, params),
		queryFn: () => fetchAdminUsers(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

/*
 * Admin organizations
 */
type FetchAdminOrganizationsParams = {
	itemsPerPage: number;
	currentPage: number;
	searchTerm: string;
};
export const adminOrganizationsQueryKey = ["admin", "organizations"];
export const fetchAdminOrganizations = async ({
	itemsPerPage,
	currentPage,
	searchTerm,
}: FetchAdminOrganizationsParams) => {
	const response = await apiClient.admin.organizations.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			query: searchTerm,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch organizations");
	}

	return response.json();
};
export const useAdminOrganizationsQuery = (
	params: FetchAdminOrganizationsParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminOrganizationsQueryKey, params),
		queryFn: () => fetchAdminOrganizations(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

/*
 * Admin events
 */
type FetchAdminEventsParams = {
	limit: number;
	offset: number;
	query?: string;
	status?: string;
};

export type AdminEventPayload = {
	slug?: string;
	title: Record<string, unknown>;
	category: string;
	rules: Record<string, unknown>;
	image?: string | null;
	plannedEndAt?: string | null;
	activatedAt?: string | null;
	resolvedAt?: string | null;
	status: string;
};

export const adminEventsQueryKey = ["admin", "events"];
export const fetchAdminEvents = async (params: FetchAdminEventsParams) => {
	const response = await apiClient.admin.events.$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			status: params.status,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch events");
	}

	return response.json();
};

export const useAdminEventsQuery = (params: FetchAdminEventsParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminEventsQueryKey, params),
		queryFn: () => fetchAdminEvents(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminEventMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminEventPayload) => {
			const response = await apiClient.admin.events.$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create event");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminEventMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminEventPayload & { id: string }) => {
			const response = await apiClient.admin.events[":id"].$put({
				param: { id },
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not update event");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminEventMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.admin.events[":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				throw new Error("Could not delete event");
			}
		},
	});
};

/*
 * Admin markets
 */
type FetchAdminMarketsParams = {
	limit: number;
	offset: number;
	query?: string;
	eventId?: string;
};

export type AdminMarketPayload = {
	eventId: string;
	slug?: string;
	title: Record<string, unknown>;
	image?: string | null;
	status: string;
	activatedAt?: string | null;
	resolvedAt?: string | null;
	cancelledAt?: string | null;
	totalTradeVolume?: string | null;
};

export const adminMarketsQueryKey = ["admin", "markets"];
export const fetchAdminMarkets = async (params: FetchAdminMarketsParams) => {
	const response = await apiClient.admin.markets.$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			eventId: params.eventId,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch markets");
	}

	return response.json();
};

export const useAdminMarketsQuery = (params: FetchAdminMarketsParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminMarketsQueryKey, params),
		queryFn: () => fetchAdminMarkets(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminMarketMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminMarketPayload) => {
			const response = await apiClient.admin.markets.$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create market");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminMarketMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminMarketPayload & { id: string }) => {
			const response = await apiClient.admin.markets[":id"].$put({
				param: { id },
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not update market");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminMarketMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.admin.markets[":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				throw new Error("Could not delete market");
			}
		},
	});
};

/*
 * Admin agents
 */
type FetchAdminAgentsParams = {
	limit: number;
	offset: number;
	query?: string;
	isActive?: boolean;
};

export type AdminAgentPayload = {
	slug: string;
	name: string;
	description?: string | null;
	avatarUrl?: string | null;
	modelVendor: string;
	modelName: string;
	isActive?: boolean;
	metadata?: Record<string, unknown> | null;
};

export const adminAgentsQueryKey = ["admin", "agents"];
export const fetchAdminAgents = async (params: FetchAdminAgentsParams) => {
	const response = await apiClient.admin.agents.$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			isActive:
				typeof params.isActive === "boolean"
					? params.isActive.toString()
					: undefined,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch agents");
	}

	return response.json();
};

export const useAdminAgentsQuery = (params: FetchAdminAgentsParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminAgentsQueryKey, params),
		queryFn: () => fetchAdminAgents(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminAgentMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminAgentPayload) => {
			const response = await apiClient.admin.agents.$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create agent");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminAgentMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminAgentPayload & { id: string }) => {
			const response = await apiClient.admin.agents[":id"].$put({
				param: { id },
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not update agent");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminAgentMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.admin.agents[":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				throw new Error("Could not delete agent");
			}
		},
	});
};

/*
 * Admin agent reports
 */
type FetchAdminAgentReportsParams = {
	limit: number;
	offset: number;
	query?: string;
	agentId?: string;
	eventId?: string;
};

export type AdminAgentReportPayload = {
	agentId: string;
	eventId: string;
	reportDate: string;
	headline?: string | null;
	summary?: string | null;
	rawOutput?: unknown;
	confidence?: string | null;
};

export const adminAgentReportsQueryKey = ["admin", "agent-reports"];
export const fetchAdminAgentReports = async (
	params: FetchAdminAgentReportsParams,
) => {
	const response = await apiClient.admin["agent-reports"].$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			agentId: params.agentId,
			eventId: params.eventId,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch agent reports");
	}

		return response.json();
};

export const useAdminAgentReportsQuery = (
	params: FetchAdminAgentReportsParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminAgentReportsQueryKey, params),
		queryFn: () => fetchAdminAgentReports(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminAgentReportMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminAgentReportPayload) => {
			const response = await apiClient.admin["agent-reports"].$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create agent report");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminAgentReportMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminAgentReportPayload & { id: string }) => {
			const response =
				await apiClient.admin["agent-reports"][":id"].$put({
					param: { id },
					json: payload,
				});

			if (!response.ok) {
				throw new Error("Could not update agent report");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminAgentReportMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response =
				await apiClient.admin["agent-reports"][":id"].$delete({
					param: { id },
				});

			if (!response.ok) {
				throw new Error("Could not delete agent report");
			}
		},
	});
};

/*
 * Agent report probabilities
 */
type FetchAdminProbabilitiesParams = {
	limit: number;
	offset: number;
	query?: string;
	reportId?: string;
	marketId?: string;
};

export type AdminReportProbabilityPayload = {
	reportId: string;
	marketId: string;
	probability: string;
	rationale?: string | null;
};

export const adminProbabilitiesQueryKey = ["admin", "agent-report-probabilities"];
export const fetchAdminProbabilities = async (
	params: FetchAdminProbabilitiesParams,
) => {
	const response = await apiClient.admin["agent-report-probabilities"].$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			reportId: params.reportId,
			marketId: params.marketId,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch probabilities");
	}

	return response.json();
};

export const useAdminProbabilitiesQuery = (
	params: FetchAdminProbabilitiesParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminProbabilitiesQueryKey, params),
		queryFn: () => fetchAdminProbabilities(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminProbabilityMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminReportProbabilityPayload) => {
			const response =
				await apiClient.admin["agent-report-probabilities"].$post({
					json: payload,
				});

			if (!response.ok) {
				throw new Error("Could not create probability");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminProbabilityMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminReportProbabilityPayload & { id: number }) => {
			const response =
				await apiClient.admin["agent-report-probabilities"][":id"].$put({
					param: { id: id.toString() },
					json: payload,
				});

			if (!response.ok) {
				throw new Error("Could not update probability");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminProbabilityMutation = () => {
	return useMutation({
		mutationFn: async (id: number) => {
			const response =
				await apiClient.admin["agent-report-probabilities"][":id"].$delete({
					param: { id: id.toString() },
				});

			if (!response.ok) {
				throw new Error("Could not delete probability");
			}
		},
	});
};

/*
 * Agent orders
 */
type FetchAdminAgentOrdersParams = {
	limit: number;
	offset: number;
	query?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
};

export type AdminAgentOrderPayload = {
	agentId: string;
	eventId: string;
	marketId: string;
	reportId?: string | null;
	stakeAmount: string;
	stakeCurrency: string;
	expectedRoiPct?: string | null;
	status: string;
	notes?: string | null;
	txHash?: string | null;
	executedAt?: string | null;
	createdById?: string | null;
};

export const adminAgentOrdersQueryKey = ["admin", "agent-orders"];
export const fetchAdminAgentOrders = async (
	params: FetchAdminAgentOrdersParams,
) => {
	const response = await apiClient.admin["agent-orders"].$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			agentId: params.agentId,
			eventId: params.eventId,
			marketId: params.marketId,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch agent orders");
	}

	return response.json();
};

export const useAdminAgentOrdersQuery = (
	params: FetchAdminAgentOrdersParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminAgentOrdersQueryKey, params),
		queryFn: () => fetchAdminAgentOrders(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminAgentOrderMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminAgentOrderPayload) => {
			const response = await apiClient.admin["agent-orders"].$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create agent order");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminAgentOrderMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminAgentOrderPayload & { id: string }) => {
			const response = await apiClient.admin["agent-orders"][":id"].$put({
				param: { id },
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not update agent order");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminAgentOrderMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.admin["agent-orders"][":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				throw new Error("Could not delete agent order");
			}
		},
	});
};

/*
 * User investments
 */
type FetchAdminUserInvestmentsParams = {
	limit: number;
	offset: number;
	query?: string;
	userId?: string;
	agentId?: string;
	eventId?: string;
	marketId?: string;
};

export type AdminUserInvestmentPayload = {
	userId: string;
	agentId: string;
	eventId: string;
	marketId: string;
	agentOrderId?: string | null;
	amount: string;
	currency: string;
	status: string;
	txHash?: string | null;
	expectedRoiPct?: string | null;
	settledPnl?: string | null;
	notes?: string | null;
};

export const adminUserInvestmentsQueryKey = ["admin", "user-investments"];
export const fetchAdminUserInvestments = async (
	params: FetchAdminUserInvestmentsParams,
) => {
	const response = await apiClient.admin["user-investments"].$get({
		query: {
			limit: params.limit.toString(),
			offset: params.offset.toString(),
			query: params.query,
			userId: params.userId,
			agentId: params.agentId,
			eventId: params.eventId,
			marketId: params.marketId,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch user investments");
	}

	return response.json();
};

export const useAdminUserInvestmentsQuery = (
	params: FetchAdminUserInvestmentsParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminUserInvestmentsQueryKey, params),
		queryFn: () => fetchAdminUserInvestments(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useCreateAdminUserInvestmentMutation = () => {
	return useMutation({
		mutationFn: async (payload: AdminUserInvestmentPayload) => {
			const response = await apiClient.admin["user-investments"].$post({
				json: payload,
			});

			if (!response.ok) {
				throw new Error("Could not create user investment");
			}

			return response.json();
		},
	});
};

export const useUpdateAdminUserInvestmentMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		}: AdminUserInvestmentPayload & { id: string }) => {
			const response =
				await apiClient.admin["user-investments"][":id"].$put({
					param: { id },
					json: payload,
				});

			if (!response.ok) {
				throw new Error("Could not update user investment");
			}

			return response.json();
		},
	});
};

export const useDeleteAdminUserInvestmentMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response =
				await apiClient.admin["user-investments"][":id"].$delete({
					param: { id },
				});

			if (!response.ok) {
				throw new Error("Could not delete user investment");
			}
		},
	});
};
