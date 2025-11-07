export const stringifyJsonField = (value: unknown) => {
	if (value === undefined || value === null) {
		return "";
	}

	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "";
	}
};

export const parseJsonField = <T = Record<string, unknown>>(
	value: string,
	fallback: T,
): T => {
	if (!value || !value.trim()) {
		return fallback;
	}

	try {
		return JSON.parse(value) as T;
	} catch (error) {
		throw new Error("INVALID_JSON");
	}
};

export const formatDateTimeLocal = (value?: string | Date | null) => {
	if (!value) {
		return "";
	}

	const date = typeof value === "string" ? new Date(value) : value;

	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().slice(0, 16);
};

export const formatDecimalInput = (value: unknown) => {
	if (value === undefined || value === null) {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number") {
		return value.toString();
	}

	if (typeof value === "object" && value !== null && "toString" in value) {
		return (value as { toString: () => string }).toString();
	}

	return "";
};

export const emptyToNull = (value?: string | null) => {
	if (value === undefined) {
		return undefined;
	}

	return value && value.trim().length > 0 ? value : null;
};

export const emptyToUndefined = (value?: string | null) => {
	if (value === undefined) {
		return undefined;
	}

	return value && value.trim().length > 0 ? value : undefined;
};

export const pickFirstTextValue = (value: unknown) => {
	if (!value || typeof value !== "object") {
		return "";
	}

	for (const candidate of Object.values(
		value as Record<string, unknown>,
	)) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}

	return "";
};
