"use client";

import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { AlertThresholdsSection } from "@/components/settings/alert-thresholds-section";
import { BlacklistedCountriesSection } from "@/components/settings/blacklisted-countries-section";
import { ProfessionsSection } from "@/components/settings/professions-section";
import { CompaniesSection } from "@/components/settings/companies-section";
import { StatusesSection } from "@/components/settings/statuses-section";
import { DocumentThresholdsSection } from "@/components/settings/document-thresholds-section";
import { BonusAdminSection } from "@/components/settings/bonus-admin-section";
import { Settings, Globe, Briefcase, Building2, ListChecks, FileWarning, Gift } from "lucide-react";

export default function SettingsAdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    System Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure alert thresholds, manage countries, professions, and statuses
                </p>
            </div>

            <Tabs defaultValue="thresholds" className="space-y-4">
                <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <TabsTrigger value="thresholds" className="gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Alert Thresholds
                    </TabsTrigger>
                    <TabsTrigger value="document-alerts" className="gap-1.5">
                        <FileWarning className="h-3.5 w-3.5" />
                        Document Alerts
                    </TabsTrigger>
                    <TabsTrigger value="countries" className="gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Countries
                    </TabsTrigger>
                    <TabsTrigger value="professions" className="gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Professions
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Companies
                    </TabsTrigger>
                    <TabsTrigger value="statuses" className="gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        Statuses
                    </TabsTrigger>
                    <TabsTrigger value="bonus-admin" className="gap-1.5">
                        <Gift className="h-3.5 w-3.5" />
                        Referrer Bonus
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="thresholds">
                    <AlertThresholdsSection />
                </TabsContent>

                <TabsContent value="document-alerts">
                    <DocumentThresholdsSection />
                </TabsContent>

                <TabsContent value="countries">
                    <BlacklistedCountriesSection />
                </TabsContent>

                <TabsContent value="professions">
                    <ProfessionsSection />
                </TabsContent>

                <TabsContent value="companies">
                    <CompaniesSection />
                </TabsContent>

                <TabsContent value="statuses">
                    <StatusesSection />
                </TabsContent>

                <TabsContent value="bonus-admin">
                    <BonusAdminSection />
                </TabsContent>
            </Tabs>
        </div>
    );
}

