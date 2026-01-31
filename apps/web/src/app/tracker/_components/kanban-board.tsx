"use client";

import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";

import type { Application, ApplicationStatus } from "../types";
import { COLUMN_ORDER } from "../types";
import { getInitialBoardState } from "../dummy-data";
import { KanbanColumn } from "./kanban-column";

export function KanbanBoard() {
    const [columns, setColumns] = useState<Record<ApplicationStatus, Application[]>>(getInitialBoardState);

    const handleDragEnd = (result: DropResult) => {
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

        // Clone the source and destination arrays
        const sourceApps = [...columns[sourceStatus]];
        const destApps = sourceStatus === destStatus ? sourceApps : [...columns[destStatus]];

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
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full overflow-x-auto pb-4 px-1">
                {COLUMN_ORDER.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        applications={columns[status]}
                    />
                ))}
            </div>
        </DragDropContext>
    );
}
