"use client";

import { Droppable } from "@hello-pangea/dnd";

import type { ApplicationStatus } from "../types";
import { COLUMN_CONFIG } from "../types";
import { KanbanCard } from "./application-card";
import type { Application } from "@/lib/api/applications";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
}

export function KanbanColumn({ status, applications }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className="flex flex-col h-full min-w-75 max-w-75 bg-muted/30 border border-transparent hover:border-primary/70">
      {/* Column Header */}
      <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border/50", config.bgColor)}>
        <div className="flex items-center gap-2.5">
          <h3 className={cn("font-semibold text-sm", config.color)}>
            {config.title}
          </h3>
          <span
            className={`
            inline-flex items-center justify-center min-w-5.5 h-5.5 px-1.5
            text-xs font-medium
            bg-background/80 text-foreground/70
            ring-1 ring-border/50
          `}
          >
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn("flex-1 p-2 space-y-2 overflow-y-auto transition-colors duration-200", snapshot.isDraggingOver && "bg-primary/5")}
          >
            {applications.map((application, index) => (
              <KanbanCard
                key={application.id}
                application={application}
                index={index}
              />
            ))}
            {provided.placeholder}

            {/* Empty State */}
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/60 border-2 border-dashed border-border/30">
                Drop applications here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
