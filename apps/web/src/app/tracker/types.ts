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
    LISTED: { title: "Listed", color: "text-slate-600 dark:text-slate-300", bgColor: "bg-slate-100 dark:bg-slate-800" },
    APPLIED: { title: "Applied", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950" },
    INTERVIEW: { title: "Interview", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950" },
    OFFER: { title: "Offer", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950" },
    REJECTED: { title: "Rejected", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950" },
    DECLINED: { title: "Declined", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-900" },
    SIGNED: { title: "Signed", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950" },
};

export const COLUMN_ORDER: ApplicationStatus[] = [
    "LISTED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "DECLINED",
    "SIGNED",
];
