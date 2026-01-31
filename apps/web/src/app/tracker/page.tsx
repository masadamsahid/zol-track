import { Briefcase } from "lucide-react";

import { KanbanBoard } from "./_components/kanban-board";

export default function TrackerPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Page Header */}
            <div className="shrink-0 px-6 py-5 border-b border-border/50 bg-linear-to-r from-background via-muted/20 to-background">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            Job Application Tracker
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop to update your application status
                        </p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden p-4">
                <KanbanBoard />
            </div>
        </div>
    );
}
