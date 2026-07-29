"use client"

import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"

export {
  ShadcnTabs as Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}

export function TabsDemo() {
  return (
    <ShadcnTabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel content.</TabsContent>
      <TabsContent value="analytics">Analytics panel content.</TabsContent>
      <TabsContent value="settings">Settings panel content.</TabsContent>
    </ShadcnTabs>
  )
}
