import { apiClient } from "@shared/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const homeLatestEventQueryKey = ["home", "latestEvent"];

export const fetchHomeLatestEvent = async () => {
	const response = await apiClient.home["latest-event"].$get();

	if (!response.ok) {
		throw new Error("Could not fetch latest event");
	}

	return response.json();
};

export const useHomeLatestEventQuery = () => {
	return useQuery({
		queryKey: homeLatestEventQueryKey,
		queryFn: () => fetchHomeLatestEvent(),
		retry: false,
		refetchOnWindowFocus: false,
	});
};
