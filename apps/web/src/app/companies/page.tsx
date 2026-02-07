"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCompanies } from "@/lib/api/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function CompaniesPage() {
	const { data: companies, isLoading, error } = useQuery({
		queryKey: ["companies"],
		queryFn: () => searchCompanies().then(res => res.data),
	});

	if (isLoading) {
		return (
			<div className="container mx-auto py-10">
				<h1 className="text-3xl font-bold mb-6">Companies</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="h-48">
							<CardHeader>
								<Skeleton className="h-6 w-3/4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-5/6" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-10 text-center">
				<h1 className="text-3xl font-bold mb-6">Companies</h1>
				<p className="text-destructive">Failed to load companies.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">Companies</h1>

			{companies?.length === 0 ? (
				<p className="text-muted-foreground text-center py-10">No companies found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{companies?.map((company) => (
						<Link href={`/companies/${company.slug}` as any} key={company.id} className="block group">
							<Card className="h-full transition-all hover:border-primary hover:shadow-md">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between gap-4">
										<CardTitle className="text-xl group-hover:text-primary transition-colors">
											{company.name}
										</CardTitle>
										{company.logoUrl && (
											<img
												src={company.logoUrl}
												alt={`${company.name} logo`}
												className="w-12 h-12 object-contain rounded-md bg-muted p-1"
											/>
										)}
									</div>
								</CardHeader>
								<CardContent>
									{company.address && (
										<div className="flex items-center text-sm text-muted-foreground mb-3">
											<MapPin className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
											<span className="truncate">{company.address}</span>
										</div>
									)}
									{company.desc && (
										<p className="text-sm text-muted-foreground line-clamp-3">
											{company.desc}
										</p>
									)}
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
