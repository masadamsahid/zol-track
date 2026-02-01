"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Loader2, Building2 } from "lucide-react";
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
import { createCompany, type Company, type CreateCompanyInput } from "@/lib/api/companies";
import { slugify } from "@/lib/utils";

interface CreateCompanyDialogProps {
	trigger?: React.ComponentProps<typeof DialogTrigger>["render"];
	onSuccess?: (company: Company) => void;
	defaultName?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function CreateCompanyDialog({
	trigger,
	onSuccess,
	defaultName,
	open: controlledOpen,
	onOpenChange: setControlledOpen
}: CreateCompanyDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = setControlledOpen ?? setUncontrolledOpen;

	const form = useForm({
		defaultValues: {
			name: defaultName || "",
			slug: defaultName ? slugify(defaultName) : "",
			desc: "",
			websiteUrl: "",
			logoUrl: "",
			address: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				const payload: CreateCompanyInput = {
					name: value.name,
					slug: value.slug,
					desc: value.desc || undefined,
					websiteUrl: value.websiteUrl || undefined,
					logoUrl: value.logoUrl || undefined,
					address: value.address || undefined,
				};

				const response = await createCompany(payload);
				toast.success("Company created successfully!");
				setOpen(false);
				form.reset();
				onSuccess?.(response.data);
			} catch (error) {
				console.error(error);
				toast.error("Failed to create company. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "Company name is required"),
				slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
				desc: z.string(),
				websiteUrl: z.string(),
				logoUrl: z.string(),
				address: z.string(),
			}),
		},
	});

	// Reset default name when dialog opens or defaultName changes
	// Note: react-form doesn't reinitialize automatically, but we can set it via useEffect if needed
	// For now, simpler to just let it be initial value or manual input

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger render={trigger} />}
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Company</DialogTitle>
					<DialogDescription>
						Add a new company to the database.
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
					{/* Name - Required */}
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">Company Name *</Label>
								<Input
									id="name"
									placeholder="e.g. Acme Corp"
									value={field.state.value}
									onChange={(e) => {
										field.handleChange(e.target.value);
										form.setFieldValue("slug", slugify(e.target.value));
									}}
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

					{/* Slug - Required */}
					<form.Field name="slug">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="slug">Slug *</Label>
								<Input
									id="slug"
									placeholder="e.g. acme-corp"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
								<p className="text-[0.8rem] text-muted-foreground">
									Unique identifier for the company URL.
								</p>
								{field.state.meta.errors.map((error) => (
									<p key={String(error)} className="text-sm text-destructive">
										{String(error)}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Website URL */}
					<form.Field name="websiteUrl">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="websiteUrl">Website URL</Label>
								<Input
									id="websiteUrl"
									placeholder="https://example.com"
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

					{/* Logo URL */}
					<form.Field name="logoUrl">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="logoUrl">Logo URL</Label>
								<Input
									id="logoUrl"
									placeholder="https://example.com/logo.png"
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


					{/* Address */}
					<form.Field name="address">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="address">Address</Label>
								<Input
									id="address"
									placeholder="e.g. Jakarta, Indonesia"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					{/* Description */}
					<form.Field name="desc">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="desc">Description</Label>
								<Textarea
									id="desc"
									placeholder="Brief description of the company..."
									rows={3}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

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
								"Create Company"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
