"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Building2, MapPin, Globe, Laptop, Building } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Application } from "@/lib/api/applications";

interface KanbanCardProps {
  application: Application;
  index: number;
}

const WorkLocationBadge = ({ type }: { type: Application["remote"] }) => {
  const config = {
    ONSITE: {
      icon: Building,
      label: "Onsite",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    },
    REMOTE: {
      icon: Globe,
      label: "Remote",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    },
    HYBRID: {
      icon: Laptop,
      label: "Hybrid",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
  };

  const { icon: Icon, label, className } = config[type];

  return (
    <span
      className={cn(
        `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium`,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const formatSalary = (
  min: number | null,
  max: number | null,
  currency: string | null,
) => {
  if (!min && !max) return null;
  const fmt = (n: number) => `${(n / 1000).toFixed(0)}k`;
  const curr = currency || "USD";
  if (min && max) return `${curr} ${fmt(min)} - ${fmt(max)}`;
  if (min) return `${curr} ${fmt(min)}+`;
  return `Up to ${curr} ${fmt(max!)}`;
};

export function KanbanCard({ application, index }: KanbanCardProps) {
  const {
    company,
    position,
    location,
    remote,
    minSalary,
    maxSalary,
    salaryCurrency,
  } = application;
  const salaryDisplay = formatSalary(minSalary, maxSalary, salaryCurrency);

  return (
    <Draggable draggableId={`${application.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            group relative bg-card border border-border rounded-lg p-3.5
            transition-all duration-200 ease-out
            hover:border-primary/30 hover:shadow-md hover:shadow-primary/5
            ${
              snapshot.isDragging
                ? "shadow-xl shadow-primary/10 border-primary/40 ring-2 ring-primary/20 rotate-2 scale-[1.02]"
                : ""
            }
          `}
        >
          {/* Company Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name || "Company"}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <Building2
                className={`w-5 h-5 text-muted-foreground ${company?.logoUrl ? "hidden" : ""}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate leading-tight">
                {position}
              </h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {company?.name || "Unknown Company"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <WorkLocationBadge type={remote} />
              {salaryDisplay && (
                <span className="text-xs font-medium text-foreground/80">
                  {salaryDisplay}
                </span>
              )}
            </div>
          </div>

          {/* Hover Actions Indicator */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg" />
        </div>
      )}
    </Draggable>
  );
}
