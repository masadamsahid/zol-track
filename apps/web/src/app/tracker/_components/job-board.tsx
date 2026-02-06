"use client";

import { useCallback, useEffect, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Search, Filter, X } from "lucide-react";

import type { ApplicationStatus } from "../types";
import { COLUMN_ORDER } from "../types";
import { KanbanColumn } from "./status-column";
import { AddApplicationDialog } from "./add-application-dialog";
import type { Application } from "@/lib/api/applications";
import repo from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function JobBoard() {
  const [columns, setColumns] = useState<Record<ApplicationStatus, Application[]>>({
    APPLIED: [],
    DECLINED: [],
    INTERVIEW: [],
    LISTED: [],
    OFFER: [],
    REJECTED: [],
    SIGNED: [],
  });

  // Filter States
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState<"ONSITE" | "REMOTE" | "HYBRID" | undefined>();

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce location
  const [debouncedLocation, setDebouncedLocation] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await repo.applications.getMyApplications({
        search: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
        remote: workType,
      });

      const mappedData: Record<ApplicationStatus, Application[]> = {
        APPLIED: [],
        DECLINED: [],
        INTERVIEW: [],
        LISTED: [],
        OFFER: [],
        REJECTED: [],
        SIGNED: [],
      };

      data.data.forEach((app) => {
        mappedData[app.status].push(app);
      });

      setColumns(mappedData);
    } catch (error) {
      console.error(error);
    }
  }, [debouncedSearch, debouncedLocation, workType]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as ApplicationStatus;
    const destStatus = destination.droppableId as ApplicationStatus;

    try {
      await repo.applications.updateApplication(Number(result.draggableId), {
        status: destStatus,
      });

      // Clone the source and destination arrays
      const sourceApps = [...columns[sourceStatus]];
      const destApps =
        sourceStatus === destStatus ? sourceApps : [...columns[destStatus]];

      // Remove the item from source
      const [movedApp] = sourceApps.splice(source.index, 1);

      if (!movedApp) return;

      // Update the application's status
      const updatedApp: Application = {
        ...movedApp,
        status: destStatus,
      };

      // Insert at destination
      destApps.splice(destination.index, 0, updatedApp);

      // Update state
      if (sourceStatus === destStatus) {
        // Reordering within the same column
        setColumns((prev) => ({
          ...prev,
          [sourceStatus]: destApps,
        }));
      } else {
        // Moving to a different column
        setColumns((prev) => ({
          ...prev,
          [sourceStatus]: sourceApps,
          [destStatus]: destApps,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hasActiveFilters = !!debouncedSearch || !!debouncedLocation || !!workType;

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search, Filter & Add Button */}
      <div className="flex items-center justify-between pb-4 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by position or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex flex-1 items-center gap-2">
            {/* Location Filter */}
            <div className="relative flex-1">
              <Input
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Work Type Filter */}
            <Select
              value={workType || "ALL"}
              onValueChange={(value) => setWorkType(value === "ALL" ? undefined : value as "ONSITE" | "REMOTE" | "HYBRID")}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ONSITE">Onsite</SelectItem>
                <SelectItem value="REMOTE">Remote</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setWorkType(undefined);
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <AddApplicationDialog onSuccess={fetchApplications} />
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4 px-1">
          {COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status]}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
