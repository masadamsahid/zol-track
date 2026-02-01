"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus, Loader2, Search, X, Building2 } from "lucide-react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import repo from "@/lib/api";
import type { CreateApplicationInput } from "@/lib/api/applications";
import type { Company } from "@/lib/api/companies";

interface AddApplicationDialogProps {
	onSuccess?: () => void;
}

export function AddApplicationDialog({ onSuccess }: AddApplicationDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Company search state
	const [companySearch, setCompanySearch] = useState("");
	const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Debounced company search
	useEffect(() => {
		if (!companySearch.trim() || selectedCompany) {
			setCompanySuggestions([]);
			return;
		}

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(async () => {
			setIsSearching(true);
			try {
				const result = await repo.companies.searchCompanies({
					search: companySearch,
					limit: 10,
				});
				setCompanySuggestions(result.data);
				setShowSuggestions(true);
			} catch (error) {
				console.error("Failed to search companies:", error);
			} finally {
				setIsSearching(false);
			}
		}, 500);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [companySearch, selectedCompany]);

	const handleSelectCompany = (company: Company) => {
		setSelectedCompany(company);
		setCompanySearch(company.name);
		setShowSuggestions(false);
		setCompanySuggestions([]);
	};

	const handleClearCompany = () => {
		setSelectedCompany(null);
		setCompanySearch("");
		setCompanySuggestions([]);
		inputRef.current?.focus();
	};

	const form = useForm({
		defaultValues: {
			position: "",
			location: "",
			remote: "ONSITE" as "ONSITE" | "REMOTE" | "HYBRID",
			status: "LISTED" as "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" | "SIGNED" | "REJECTED" | "DECLINED",
			salaryCurrency: "IDR",
			minSalary: "" as string,
			maxSalary: "" as string,
			notes: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				const payload: CreateApplicationInput = {
					position: value.position,
					remote: value.remote,
					status: value.status,
				};

				if (selectedCompany) payload.companyId = selectedCompany.id;
				if (value.location) payload.location = value.location;
				if (value.salaryCurrency) payload.salaryCurrency = value.salaryCurrency;
				if (value.minSalary) payload.minSalary = Number(value.minSalary);
				if (value.maxSalary) payload.maxSalary = Number(value.maxSalary);
				if (value.notes) payload.notes = value.notes;

				await repo.applications.createApplication(payload);
				toast.success("Application created successfully!");
				setOpen(false);
				form.reset();
				setSelectedCompany(null);
				setCompanySearch("");
				onSuccess?.();
			} catch (error) {
				console.error(error);
				toast.error("Failed to create application. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		},
		validators: {
			onSubmit: z.object({
				position: z.string().min(1, "Position is required"),
				location: z.string(),
				remote: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
				status: z.enum(["LISTED", "APPLIED", "INTERVIEW", "OFFER", "SIGNED", "REJECTED", "DECLINED"]),
				salaryCurrency: z.string(),
				minSalary: z.string(),
				maxSalary: z.string(),
				notes: z.string(),
			}),
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={(props) => (
					<Button {...props} size="sm" className="gap-1.5">
						<Plus className="w-4 h-4" />
						Add Application
					</Button>
				)}
			/>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Add New Job Application</DialogTitle>
					<DialogDescription>
						Track a new job opportunity. Fill in the details below.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4 mt-4"
				>
					{/* Position - Required */}
					<form.Field name="position">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="position">Position *</Label>
								<Input
									id="position"
									placeholder="e.g. Software Engineer"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={String(error)} className="text-sm text-destructive">
										{String(error)}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Company Search */}
					<div className="space-y-2">
						<Label htmlFor="company">Company</Label>
						<div className="relative">
							<div className="relative">
								<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
								<Input
									ref={inputRef}
									id="company"
									placeholder="Search for a company..."
									value={companySearch}
									onChange={(e) => {
										setCompanySearch(e.target.value);
										if (selectedCompany) {
											setSelectedCompany(null);
										}
									}}
									onFocus={() => {
										if (companySuggestions.length > 0) {
											setShowSuggestions(true);
										}
									}}
									onBlur={() => {
										// Delay hiding to allow click on suggestion
										setTimeout(() => setShowSuggestions(false), 150);
									}}
									className="pl-9 pr-9"
									disabled={isSubmitting}
								/>
								{(companySearch || selectedCompany) && (
									<button
										type="button"
										onClick={handleClearCompany}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										<X className="w-4 h-4" />
									</button>
								)}
							</div>

							{/* Loading indicator */}
							{isSearching && (
								<div className="absolute right-9 top-1/2 -translate-y-1/2">
									<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
								</div>
							)}

							{/* Suggestions dropdown */}
							{showSuggestions && companySuggestions.length > 0 && (
								<div className="absolute z-50 w-full mt-1 bg-popover border border-border shadow-md max-h-48 overflow-y-auto">
									{companySuggestions.map((company) => (
										<button
											key={company.id}
											type="button"
											onClick={() => handleSelectCompany(company)}
											className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
										>
											{company.logoUrl ? (
												<img
													src={company.logoUrl}
													alt={company.name}
													className="w-8 h-8 object-contain"
												/>
											) : (
												<div className="w-8 h-8 bg-muted flex items-center justify-center">
													<Building2 className="w-4 h-4 text-muted-foreground" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<div className="text-sm font-medium truncate">{company.name}</div>
												{company.address && (
													<div className="text-xs text-muted-foreground truncate">{company.address}</div>
												)}
											</div>
										</button>
									))}
								</div>
							)}

							{/* No results message */}
							{showSuggestions && companySuggestions.length === 0 && companySearch && !isSearching && !selectedCompany && (
								<div className="absolute z-50 w-full mt-1 bg-popover border border-border shadow-md px-3 py-2 text-sm text-muted-foreground">
									No companies found
								</div>
							)}
						</div>

						{/* Selected company indicator */}
						{selectedCompany && (
							<div className="flex items-center gap-3 p-2 border bg-muted/30">
								{selectedCompany.logoUrl ? (
									<img
										src={selectedCompany.logoUrl}
										alt={selectedCompany.name}
										className="w-10 h-10 object-contain bg-background p-1 border"
									/>
								) : (
									<div className="w-10 h-10 bg-muted flex items-center justify-center rounded-sm border shrink-0">
										<Building2 className="w-5 h-5 text-muted-foreground" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium truncate">
										{selectedCompany.name}
									</div>
									{selectedCompany.address && (
										<div className="text-xs text-muted-foreground truncate">
											{selectedCompany.address}
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Location */}
					<form.Field name="location">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									placeholder="e.g. Jakarta, Indonesia"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					{/* Work Type & Status Row */}
					<div className="grid grid-cols-2 gap-4">
						<form.Field name="remote">
							{(field) => (
								<div className="space-y-2">
									<Label>Work Type</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											if (value) field.handleChange(value as "ONSITE" | "REMOTE" | "HYBRID");
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select work type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ONSITE">Onsite</SelectItem>
											<SelectItem value="REMOTE">Remote</SelectItem>
											<SelectItem value="HYBRID">Hybrid</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="status">
							{(field) => (
								<div className="space-y-2">
									<Label>Status</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											if (value) field.handleChange(
												value as "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" |
												"SIGNED" | "REJECTED" | "DECLINED"
											);
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="LISTED">Listed</SelectItem>
											<SelectItem value="APPLIED">Applied</SelectItem>
											<SelectItem value="INTERVIEW">Interview</SelectItem>
											<SelectItem value="OFFER">Offer</SelectItem>
											<SelectItem value="SIGNED">Signed</SelectItem>
											<SelectItem value="REJECTED">Rejected</SelectItem>
											<SelectItem value="DECLINED">Declined</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>
					</div>


					{/* Salary Row */}
					<div className="grid grid-cols-3 gap-3">
						<form.Field name="salaryCurrency">
							{(field) => (
								<div className="space-y-2">
									<Label>Currency</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											if (value) field.handleChange(value);
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Currency" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="IDR">IDR</SelectItem>
											<SelectItem value="USD">USD</SelectItem>
											<SelectItem value="SGD">SGD</SelectItem>
											<SelectItem value="MYR">MYR</SelectItem>
											<SelectItem value="EUR">EUR</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="minSalary">
							{(field) => (
								<div className="space-y-2">
									<Label>Min Salary</Label>
									<Input
										type="number"
										placeholder="Min"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="maxSalary">
							{(field) => (
								<div className="space-y-2">
									<Label>Max Salary</Label>
									<Input
										type="number"
										placeholder="Max"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>
					</div>

					{/* Notes */}
					<form.Field name="notes">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="notes">Notes</Label>
								<Textarea
									id="notes"
									placeholder="Additional notes about this application..."
									rows={3}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					{/* Submit Button */}
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								"Create Application"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
