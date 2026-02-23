"use client";

import { useState, useEffect } from "react";
import { useSystemConfig, useUpdateConfig } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Save, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

function useAdminUsers() {
    return useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("users")
                .select("id, full_name, email")
                .eq("role", "ADMIN")
                .eq("is_active", true)
                .order("full_name");
            if (error) throw error;
            return data || [];
        },
    });
}

export function BonusAdminSection() {
    const { data: config, isLoading: configLoading } = useSystemConfig();
    const { data: admins, isLoading: adminsLoading } = useAdminUsers();
    const updateConfig = useUpdateConfig();

    const [selectedAdmin, setSelectedAdmin] = useState<string>("");

    useEffect(() => {
        if (config) {
            const found = config.find((c) => c.key === "referrer_bonus_admin_id");
            if (found && found.value) {
                const val = String(found.value).replace(/^"|"$/g, "");
                setSelectedAdmin(val);
            }
        }
    }, [config]);

    function handleSave() {
        updateConfig.mutate([
            {
                key: "referrer_bonus_admin_id",
                value: selectedAdmin,
            },
        ]);
    }

    if (configLoading || adminsLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-[300px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <p className="text-sm text-muted-foreground">
                    Select the admin user responsible for managing referrer bonus payments.
                    When a candidate arrives in Israel, only this admin will receive the bonus payment alert.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bonus-admin">Responsible Admin</Label>
                <p className="text-xs text-muted-foreground">
                    This admin will receive alerts when referrer bonuses need to be paid
                </p>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                    <SelectTrigger id="bonus-admin" className="max-w-[350px]">
                        <SelectValue placeholder="Select an admin..." />
                    </SelectTrigger>
                    <SelectContent>
                        {admins?.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                                <div className="flex items-center gap-2">
                                    <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{admin.full_name}</span>
                                    <span className="text-xs text-muted-foreground">({admin.email})</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button
                onClick={handleSave}
                disabled={updateConfig.isPending || !selectedAdmin}
                size="sm"
            >
                <Save className="h-4 w-4 mr-1.5" />
                {updateConfig.isPending ? "Saving..." : "Save Assignment"}
            </Button>
        </div>
    );
}
