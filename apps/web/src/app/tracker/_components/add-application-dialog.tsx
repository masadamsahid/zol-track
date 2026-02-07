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
import { CreateCompanyDialog } from "@/components/create-company-dialog";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface AddApplicationDialogProps {
	onSuccess?: () => void;
	application?: Application;
	trigger?: React.ReactNode;
	refetchApplication?: boolean;
}

import type { Application } from "@/lib/api/applications";

export function AddApplicationDialog({ onSuccess, application, trigger, refetchApplication = false }: AddApplicationDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	const isUpdateMode = !!application;

	// Company search state
	const [companySearch, setCompanySearch] = useState(application?.company?.name || "");
	const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(application?.company as Company || null);
	const [isSearching, setIsSearching] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Reset state when application changes or dialog opens
	useEffect(() => {
		if (open) {
			setCompanySearch(application?.company?.name || "");
			setSelectedCompany(application?.company as Company || null);

			// If in update mode, fetch the full application details to ensure all fields (like jobUrl, jobDescription) are present
			if (isUpdateMode && application?.id) {
				const fetchDetails = async () => {
					setIsLoadingDetails(true);
					try {
						const res = await repo.applications.getApplicationById(application.id);
						const fullApp = res.data;
						console.log({ fullApp });

						// Update non-form state
						if (fullApp.company) {
							setSelectedCompany(fullApp?.company);
							setCompanySearch(fullApp.company.name || "");
						}

						// Reset form with full details
						// Update form fields using setFieldValue to ensure state updates
						form.setFieldValue("position", fullApp.position || "");
						form.setFieldValue("location", fullApp.location || "");
						form.setFieldValue("remote", (fullApp.remote || "ONSITE") as "ONSITE" | "REMOTE" | "HYBRID");
						form.setFieldValue("status", (fullApp.status || "LISTED") as "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" | "SIGNED" | "REJECTED" | "DECLINED");
						form.setFieldValue("salaryCurrency", fullApp.salaryCurrency || "IDR");
						form.setFieldValue("minSalary", fullApp.minSalary?.toString() || "");
						form.setFieldValue("maxSalary", fullApp.maxSalary?.toString() || "");
						form.setFieldValue("notes", fullApp.notes || "");
						form.setFieldValue("jobUrl", fullApp.jobUrl || "");
						form.setFieldValue("jobDescription", fullApp.jobDescription || "");
					} catch (error) {
						console.error("Failed to fetch application details:", error);
						toast.error("Failed to load full application details");
					} finally {
						setIsLoadingDetails(false);
					}
				};
				fetchDetails();
			}
		}
	}, [application, open, isUpdateMode]);

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
			position: application?.position || "",
			location: application?.location || "",
			remote: (application?.remote || "ONSITE") as "ONSITE" | "REMOTE" | "HYBRID",
			status: (application?.status || "LISTED") as "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" | "SIGNED" | "REJECTED" | "DECLINED",
			salaryCurrency: application?.salaryCurrency || "IDR",
			minSalary: application?.minSalary?.toString() || "",
			maxSalary: application?.maxSalary?.toString() || "",
			notes: application?.notes || "",
			jobUrl: application?.jobUrl || "",
			jobDescription: application?.jobDescription || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				const payload: CreateApplicationInput = {
					position: value.position,
					remote: value.remote,
					status: value.status,
					jobUrl: value.jobUrl || undefined,
					jobDescription: value.jobDescription || undefined,
					location: value.location || undefined,
					salaryCurrency: value.salaryCurrency || undefined,
					minSalary: value.minSalary ? Number(value.minSalary) : undefined,
					maxSalary: value.maxSalary ? Number(value.maxSalary) : undefined,
					notes: value.notes || undefined,
					companyId: selectedCompany?.id || undefined,
				};

				if (isUpdateMode && application) {
					await repo.applications.updateApplication(application.id, payload);
					toast.success("Application updated successfully!");
				} else {
					await repo.applications.createApplication(payload);
					toast.success("Application created successfully!");
				}

				setOpen(false);
				if (!isUpdateMode) {
					form.reset();
					setSelectedCompany(null);
					setCompanySearch("");
				}
				onSuccess?.();
			} catch (error) {
				console.error(error);
				toast.error(`Failed to ${isUpdateMode ? 'update' : 'create'} application. Please try again.`);
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
				jobUrl: z.string(),
				jobDescription: z.string(),
			}),
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={(props) => trigger ? (
					<div {...props}>{trigger}</div>
				) : (
					<Button {...props} size="sm" className="gap-1.5">
						<Plus className="w-4 h-4" />
						Add Application
					</Button>
				)}
			/>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isUpdateMode ? 'Update Job Application' : 'Add New Job Application'}</DialogTitle>
					<DialogDescription>
						{isUpdateMode
							? 'Update the details of your job application.'
							: 'Track a new job opportunity. Fill in the details below.'}
					</DialogDescription>
				</DialogHeader>

				{isLoadingDetails ? (
					<div className="flex flex-col items-center justify-center py-12 space-y-4">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">Loading application details...</p>
					</div>
				) : (
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
											setTimeout(() => setShowSuggestions(false), 200);
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
								{showSuggestions && (
									<div className="absolute z-50 w-full mt-1 bg-popover border border-border shadow-md max-h-56 overflow-y-auto">
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

										{companySearch && !isSearching && !selectedCompany && (
											<div className="p-2 border-t border-border">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="w-full justify-start text-muted-foreground hover:text-foreground"
													onMouseDown={(e) => {
														// Prevent input onBlur from closing suggestions too early
														e.preventDefault();
													}}
													onClick={() => setIsCreateCompanyOpen(true)}
												>
													<Plus className="w-4 h-4 mr-2" />
													Create "{companySearch}"
												</Button>
											</div>
										)}
									</div>
								)}

								<CreateCompanyDialog
									open={isCreateCompanyOpen}
									onOpenChange={setIsCreateCompanyOpen}
									defaultName={companySearch}
									onSuccess={(company) => {
										handleSelectCompany(company);
										setIsCreateCompanyOpen(false);
										setShowSuggestions(false);
									}}
								/>
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

						{/* Job URL row */}
						<form.Field name="jobUrl">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="jobUrl">Job URL</Label>
									<Input
										id="jobUrl"
										placeholder="https://company.com/careers/job-123"
										value={field.state.value || ""}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>


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

						{/* Job Description URL (Rich Text) */}
						<form.Field name="jobDescription">
							{(field) => (
								<div className="space-y-2">
									<Label>Job Description</Label>
									<div className="border rounded-md">
										<RichTextEditor
											value={field.state.value || ""}
											onChange={(value) => field.handleChange(value)}
											placeholder="Paste job description here..."
										/>
									</div>
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
										{isUpdateMode ? 'Updating...' : 'Creating...'}
									</>
								) : (
									isUpdateMode ? 'Update Application' : 'Create Application'
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
