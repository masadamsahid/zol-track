"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyBySlug } from "@/lib/api/companies";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompanyDetailPage() {
	const params = useParams();
	const slug = params.slug as string;

	const { data: company, isLoading, error } = useQuery({
		queryKey: ["company", slug],
		queryFn: () => getCompanyBySlug(slug).then(res => res.data),
		enabled: !!slug,
	});

	if (isLoading) {
		return (
			<div className="container mx-auto py-10 max-w-4xl">
				<div className="mb-6">
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="flex flex-col md:flex-row gap-8">
					<Skeleton className="w-32 h-32 rounded-lg" />
					<div className="flex-1 space-y-4">
						<Skeleton className="h-8 w-1/2" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-24 w-full mt-6" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !company) {
		return (
			<div className="container mx-auto py-10 text-center">
				<h1 className="text-3xl font-bold mb-6">Company Not Found</h1>
				<p className="text-destructive mb-6">Could not find the requested company.</p>
				<Button
					variant="outline"
					render={(props) => (
						<Link {...props} href="/companies">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Companies
						</Link>
					)}
				/>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 max-w-4xl">
			<div className="mb-6">
				<Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" render={(props) => (
					<Link {...props} href="/companies">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Companies
					</Link>
				)} />
			</div>

			<div className="flex flex-col md:flex-row gap-8 items-start">
				{company.logoUrl ? (
					<div className="w-32 h-32 flex-shrink-0 bg-background rounded-lg border shadow-sm p-4 flex items-center justify-center">
						<img
							src={company.logoUrl}
							alt={`${company.name} logo`}
							className="w-full h-full object-contain"
						/>
					</div>
				) : (
					<div className="w-32 h-32 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-4xl">
						{company.name.charAt(0)}
					</div>
				)}

				<div className="flex-1">
					<h1 className="text-4xl font-bold mb-2">{company.name}</h1>

					<div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
						{company.address && (
							<div className="flex items-center">
								<MapPin className="mr-1 h-4 w-4" />
								<span>{company.address}</span>
							</div>
						)}
						{company.websiteUrl && (
							<div className="flex items-center">
								<Globe className="mr-1 h-4 w-4" />
								<a
									href={company.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary hover:underline"
								>
									{company.websiteUrl.replace(/^https?:\/\//, '')}
								</a>
							</div>
						)}
					</div>

					<div className="prose dark:prose-invert max-w-none">
						<h3 className="text-xl font-semibold mb-2">About</h3>
						<p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
							{company.desc || "No description available."}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
