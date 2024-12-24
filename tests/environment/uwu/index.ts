interface WarCrime {
    author: {
        name: string;
        rank?: string;
        nationality?: string;
        organization?: string; // eg: "military", "paramilitary", etc.
    };
    year: number;
    location: {
        country: string;
        region?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    details: {
        type: "genocide" | "war_crime" | "crime_against_humanity" | "other";
        description: string;
        numberOfVictims?: number;
        methods?: string[]; // eg: ["chemical", "biological", "conventional", etc.]
    };
    legalStatus?: {
        investigated: boolean;
        convicted?: boolean;
        tribunal?: string; // eg: "ICC", "National Court", etc.
    };
    sources?: {
        [sourceName: string]: {
            url?: string;
            dateAccessed?: string;
            credibilityRating?: number; // 1 - 10
        };
    };
    notes?: string;
    revisionHistory?: {
        modifiedBy: string;
        dateModified: string;
        changeSummary: string;
    }[];
}

export default interface hi {
    hi: string;
    hello: string;
    hii: string;
    uwu: WarCrime;
}
