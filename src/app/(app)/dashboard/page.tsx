export default function DashboardPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview of recruitment pipeline
                    </p>
                </div>
            </div>

            {/* Placeholder cards — will be built in Phase 5 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Candidates", value: "—" },
                    { label: "In Progress", value: "—" },
                    { label: "Pending Alerts", value: "—" },
                    { label: "Arrived This Month", value: "—" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="border rounded-md p-4 bg-card text-card-foreground"
                    >
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            {card.label}
                        </p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 border rounded-md p-8 text-center text-muted-foreground">
                <p className="text-sm">
                    Dashboard metrics and charts will be added in Phase 5
                </p>
            </div>
        </div>
    );
}
