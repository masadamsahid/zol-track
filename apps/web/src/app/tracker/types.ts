// Application status types matching the database schema
export type ApplicationStatus =
    | "LISTED"
    | "APPLIED"
    | "INTERVIEW"
    | "OFFER"
    | "REJECTED"
    | "DECLINED"
    | "SIGNED";

export type WorkLocationType = "ONSITE" | "REMOTE" | "HYBRID";

export interface Company {
    id: number;
    slug: string | null;
    name: string | null;
    desc: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    address: string | null;
}

export interface Application {
    id: number;
    companyId: number;
    userId: string;
    position: string;
    jobUrl: string | null;
    jobDescription: string | null;
    notes: string | null;
    salaryCurrency: string | null;
    minSalary: number | null;
    maxSalary: number | null;
    location: string | null;
    remote: WorkLocationType;
    listedAt: Date;
    appliedAt: Date | null;
    interviewAt: Date | null;
    offerAt: Date | null;
    rejectedAt: Date | null;
    declinedAt: Date | null;
    signedAt: Date | null;
    // Computed status based on timestamps
    status: ApplicationStatus;
    // Joined company data
    company: Company;
}

export interface KanbanColumn {
    id: ApplicationStatus;
    title: string;
    applications: Application[];
}

export interface KanbanBoardState {
    columns: Record<ApplicationStatus, Application[]>;
}

// Column configuration with colors
export const COLUMN_CONFIG: Record<ApplicationStatus, { title: string; color: string; bgColor: string }> = {
    LISTED: { title: "Listed", color: "text-ja-listed-text", bgColor: "bg-ja-listed-bg" },
    APPLIED: { title: "Applied", color: "text-ja-applied-text", bgColor: "bg-ja-applied-bg" },
    INTERVIEW: { title: "Interview", color: "text-ja-interview-text", bgColor: "bg-ja-interview-bg" },
    OFFER: { title: "Offer", color: "text-ja-offer-text", bgColor: "bg-ja-offer-bg" },
    SIGNED: { title: "Signed", color: "text-ja-signed-text", bgColor: "bg-ja-signed-bg" },
    DECLINED: { title: "Declined", color: "text-ja-declined-text", bgColor: "bg-ja-declined-bg" },
    REJECTED: { title: "Rejected", color: "text-ja-rejected-text", bgColor: "bg-ja-rejected-bg" },
};

export const COLUMN_ORDER: ApplicationStatus[] = [
    "LISTED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "SIGNED",
    "DECLINED",
    "REJECTED",
];
