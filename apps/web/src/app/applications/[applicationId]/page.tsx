"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Globe, Laptop, Building, Calendar, DollarSign } from "lucide-react";

import repo from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application } from "@/lib/api/applications";
import { cn } from "@/lib/utils";

export default function ApplicationDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const applicationId = Number(params.applicationId);

	const { data: application, isLoading, error } = useQuery({
		queryKey: ["application", applicationId],
		queryFn: async () => {
			const res = await repo.applications.getApplicationById(applicationId);
			return res.data;
		},
		enabled: !!applicationId && !isNaN(applicationId),
	});

	if (isLoading) {
		return <ApplicationDetailsSkeleton />;
	}

	if (error || !application) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Application not found</h2>
				<p className="text-muted-foreground mb-4">The application you are looking for does not exist or you don't have access.</p>
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="container max-w-4xl mx-auto py-8 px-4">
			<Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Board
			</Button>

			<div className="grid gap-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row gap-6 items-start justify-between">
					<div className="flex gap-4">
						<div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border shadow-sm">
							{application.company?.logoUrl ? (
								<img
									src={application.company.logoUrl}
									alt={application.company.name || "Company"}
									className="h-10 w-10 object-contain"
								/>
							) : (
								<Building2 className="h-8 w-8 text-muted-foreground" />
							)}
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight">{application.position}</h1>
							<div className="flex items-center gap-2 text-muted-foreground mt-1">
								<span className="font-medium text-foreground">{application.company?.name || "Unknown Company"}</span>
								<span>•</span>
								<span className="text-sm">{new Date(application.createdAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>

					<div className="flex gap-2">
						<StatusBadge status={application.status} />
					</div>
				</div>

				<Separator />

				{/* Details Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
					<div className="space-y-6">

						<div className="space-y-4">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								Employment Details
							</h3>
							<div className="grid gap-3">
								{application.location && (
									<div className="flex items-center gap-3 text-sm">
										<MapPin className="h-4 w-4 text-muted-foreground/70" />
										<span>{application.location}</span>
									</div>
								)}
								<div className="flex items-center gap-3 text-sm">
									<LocationTypeIcon type={application.remote} />
									<span className="capitalize">{application.remote.toLowerCase()}</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<DollarSign className="h-4 w-4 text-muted-foreground/70" />
									<span>{formatSalary(application.minSalary, application.maxSalary, application.salaryCurrency)}</span>
								</div>
							</div>
						</div>

						{application.jobUrl ? (
							<div className="pt-2">
								<Button variant="outline" className="w-full md:w-auto" render={({ onClick }) => (
									<a href={`${application.jobUrl}`} target="_blank" rel="noopener noreferrer" onClick={onClick} >
										View Official Job Post
									</a>
								)}>
								</Button>
							</div>
						) : (
							// Say "No job URL provided"
							<div className="pt-2">
								<Button variant="outline" className="w-full md:w-auto">
									No job URL provided
								</Button>
							</div>
						)}
					</div>

					<div className="space-y-6">
						{application.notes ? (
							<div className="bg-muted/30 p-4 rounded-lg border">
								<h3 className="font-semibold mb-2">My Notes</h3>
								<p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.notes}</p>
							</div>
						) : (
							<div className="bg-muted/30 p-4 rounded-lg border">
								<h3 className="font-semibold mb-2">My Notes</h3>
								<p className="text-sm whitespace-pre-wrap text-muted-foreground">No notes added yet.</p>
							</div>
						)}
					</div>
				</div>

				{application.jobDescription ? (
					<>
						<Separator />
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Job Description</h3>
							<div
								className="prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-muted-foreground"
								dangerouslySetInnerHTML={{ __html: application.jobDescription }}
							/>
						</div>
					</>
				) : (
					<div className="bg-muted/30 p-4 rounded-lg border">
						<h3 className="font-semibold mb-2">Job Description</h3>
						<p className="text-sm whitespace-pre-wrap text-muted-foreground">No job description available.</p>
					</div>
				)}

			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: Application["status"] }) {
	const variants: Record<string, string> = {
		LISTED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
		APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
		INTERVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
		OFFER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
		SIGNED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
		REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
		DECLINED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	};

	return (
		<Badge variant="secondary" className={cn("capitalize px-3 py-1", variants[status] || "")}>
			{status.toLowerCase()}
		</Badge>
	);
}

function LocationTypeIcon({ type }: { type: Application["remote"] }) {
	if (type === "REMOTE") return <Globe className="h-4 w-4 text-muted-foreground/70" />;
	if (type === "HYBRID") return <Laptop className="h-4 w-4 text-muted-foreground/70" />;
	return <Building className="h-4 w-4 text-muted-foreground/70" />;
}

const formatSalary = (
	min: number | null,
	max: number | null,
	currency: string | null,
) => {
	if (!min && !max) return "Not disclosed";
	const fmt = (n: number) => {
		if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
		return n.toString();
	};
	const curr = currency || "USD";
	if (min && max) return `${curr} ${fmt(min)} - ${fmt(max)}`;
	if (min) return `${curr} ${fmt(min)}+`;
	return `Up to ${curr} ${fmt(max!)}`;
};


function ApplicationDetailsSkeleton() {
	return (
		<div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
			<div className="h-10 w-32 bg-muted rounded animate-pulse" />
			<div className="flex flex-col md:flex-row gap-6 items-start justify-between">
				<div className="flex gap-4 w-full">
					<div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
					<div className="space-y-2 w-1/2">
						<div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
						<div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
					</div>
				</div>
			</div>
			<Separator />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
				<div className="space-y-4">
					<div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
					<div className="space-y-2">
						<div className="h-4 w-full bg-muted rounded animate-pulse" />
						<div className="h-4 w-full bg-muted rounded animate-pulse" />
						<div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
					</div>
				</div>
				<div className="space-y-4">
					<div className="h-24 w-full bg-muted rounded animate-pulse" />
				</div>
			</div>
			<Separator />
			<div className="space-y-4">
				<div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
				<div className="space-y-2">
					<div className="h-4 w-full bg-muted rounded animate-pulse" />
					<div className="h-4 w-full bg-muted rounded animate-pulse" />
					<div className="h-4 w-full bg-muted rounded animate-pulse" />
					<div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
				</div>
			</div>
		</div>
	)
}
