"use client";

import { useCallback, useEffect, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";

import type { ApplicationStatus } from "../types";
import { COLUMN_ORDER } from "../types";
import { KanbanColumn } from "./status-column";
import { AddApplicationDialog } from "./add-application-dialog";
import type { Application } from "@/lib/api/applications";
import repo from "@/lib/api";

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

  const fetchApplications = useCallback(async () => {
    try {
      const data = await repo.applications.getMyApplications();
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
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    console.log("result", result);

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

  return (
    <div className="flex flex-col h-full">
      {/* Header with Add Button */}
      <div className="flex justify-end pb-4">
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
