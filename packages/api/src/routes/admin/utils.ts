import { Prisma } from "@prisma/client";

export const toOptionalDate = (value?: string | null) => {
	if (value === undefined) {
		return undefined;
	}

	if (value === null || value === "") {
		return null;
	}

	return new Date(value);
};

export const toRequiredDate = (value: string) => new Date(value);

export const toDecimal = (value: string | number) => new Prisma.Decimal(value);

export const toOptionalDecimal = (value?: string | number | null) => {
	if (value === undefined) {
		return undefined;
	}

	if (value === null || value === "") {
		return null;
	}

	return new Prisma.Decimal(value);
};
