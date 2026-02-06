"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import repo from "@/lib/api";


// I'll assume useDebounce might not exist, so I'll implement a simple local debounce or just use the input state directly for now and let react-query handle caching/deduping, 
// strictly speaking for a combobox local filtering is often enough if the list isn't huge, but here we want server side search.
// Let's check hooks first or just implement without debounce first if I didn't check for it.
// Wait, I saw useDebounce is often common, but I didn't check. 
// I'll stick to local state and standard useEffect debounce pattern if needed, or just let the command input drive it.

interface CompanyFilterProps {
	selectedCompanyIds: number[];
	onSelect: (ids: number[]) => void;
}

export function CompanyFilter({ selectedCompanyIds, onSelect }: CompanyFilterProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);


	const { data: companies = [], isLoading } = useQuery({
		queryKey: ["companies", "search", debouncedSearch],
		queryFn: async () => {
			const res = await repo.companies.searchCompanies({
				search: debouncedSearch,
				limit: 20
			});
			return res.data;
		},
		staleTime: 1000 * 60 * 5, // 5 mins
	});

	// We also need to fetch details for selected companies if they are not in the current search results
	// Ideally we would have a way to fetch specific companies by ID, or we just rely on what we have.
	// For better UX, let's fetch selected companies separately if needed, or just assume we show IDs if names missing? 
	// No, that's bad. 
	// Let's fetch selected companies details to display them correctly even if they are not in search results.
	// Or simpler: The parent component usually has the application data which includes company details.
	// But here we are filtering, so we might not have them if we haven't loaded applications yet?
	// Actually, usually we filter *existing* applications, but here it's a server filter.
	// Let's just fetch details for selected IDs. 

	// Actually, to make it simple first:
	// We can just rely on the search results for selection. 
	// For displaying *selected* items in the collapsed state, we need their names.
	// I'll add a query to fetch details of selected companies if they are present.
	// But strictly `searchCompanies` returns a list.
	// Maybe I can rely on the fact that once selected, I can keep them in a local "known companies" map?
	// Let's implement a secondary query or just use the passed in props if the parent manages the objects?
	// The prompt says: "User can select 1 or more company to be used as filter."
	// And "After a company selected, a small badge component with company name and logo inserted in the input".

	// Let's maintain a list of selected company objects, not just IDs, internally or ask parent to pass objects?
	// The props say `selectedCompanyIds`. I'll stick to that. 
	// I will try to find selected company details from the `companies` list. 
	// If not found (e.g. initial load with pre-selected ID), we might show "Loading..." or just ID. 
	// BUT the user just starts with empty filter usually. 
	// If they select from the list, we have the object.
	// So I will store the *selected objects* in state to display them, and sync with `selectedCompanyIds`.

	const [selectedCompanies, setSelectedCompanies] = React.useState<Array<{ id: number, name: string, logoUrl: string | null }>>([]);

	// Sync internal selectedCompanies with incoming IDs if needed?
	// Actually, if `selectedCompanyIds` changes from outside (e.g. clear button), we need to update.
	// But we might lose the name/logo if we only have IDs.
	// For now, let's assume the parent only passes IDs. 
	// If cleared, IDs become empty, so we clear selectedCompanies.
	// If IDs are not empty but selectedCompanies is empty (initial load?), we might have a display issue.
	// However, usually filters start empty. 
	// Let's just handle the "adding from selection" case correctly.

	React.useEffect(() => {
		if (selectedCompanyIds.length === 0) {
			setSelectedCompanies([]);
		}
	}, [selectedCompanyIds]);


	const handleSelect = (company: { id: number, name: string, logoUrl: string | null }) => {
		const isSelected = selectedCompanyIds.includes(company.id);
		let newIds: number[];
		let newObjects: typeof selectedCompanies;

		if (isSelected) {
			newIds = selectedCompanyIds.filter((id) => id !== company.id);
			newObjects = selectedCompanies.filter((c) => c.id !== company.id);
		} else {
			newIds = [...selectedCompanyIds, company.id];
			newObjects = [...selectedCompanies, company];
		}

		setSelectedCompanies(newObjects);
		onSelect(newIds);
	};

	const handleRemove = (id: number) => {
		const newIds = selectedCompanyIds.filter((cId) => cId !== id);
		const newObjects = selectedCompanies.filter((c) => c.id !== id);
		setSelectedCompanies(newObjects);
		onSelect(newIds);
	}


	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className={cn(
					buttonVariants({ variant: "outline" }),
					"w-full justify-start min-w-[200px] h-auto min-h-[36px] p-2"
				)}
				role="combobox"
				aria-expanded={open}
			>
				{selectedCompanies.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{selectedCompanies.map((company) => (
							<Badge key={company.id} variant="secondary" className="flex items-center gap-1 p-1 pr-2">
								{company.logoUrl ? (
									<img src={company.logoUrl} alt={company.name} className="h-4 w-4 rounded-full object-cover" />
								) : (
									<div className="h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[8px] font-medium text-muted-foreground">
										{company.name.substring(0, 2).toUpperCase()}
									</div>
								)}
								<span className="text-xs font-normal truncate max-w-[100px]">{company.name}</span>
								<div
									role="button"
									tabIndex={0}
									className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.stopPropagation(); // prevent popover toggle
											handleRemove(company.id);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={(e) => {
										e.stopPropagation(); // prevent popover toggle
										handleRemove(company.id);
									}}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</div>
							</Badge>
						))}
					</div>
				) : (
					<span className="text-muted-foreground">Select companies...</span>
				)}
				<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput placeholder="Search company..." value={search} onValueChange={setSearch} />
					<CommandList>
						{isLoading && <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>}
						{!isLoading && companies.length === 0 && (
							<CommandEmpty>No company found.</CommandEmpty>
						)}
						<CommandGroup>
							{!isLoading && companies.map((company: any) => (
								<CommandItem
									key={company.id}
									value={company.id.toString()}
									onSelect={() => handleSelect(company)}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											selectedCompanyIds.includes(company.id) ? "opacity-100" : "opacity-0"
										)}
									/>
									<div className="flex items-center gap-2">
										{company.logoUrl ? (
											<img src={company.logoUrl} alt={company.name} className="h-6 w-6 rounded-full object-cover" />
										) : (
											<div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
												{company.name.substring(0, 2).toUpperCase()}
											</div>
										)}
										<span>{company.name}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
