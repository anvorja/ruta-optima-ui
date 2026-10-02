import { Suspense } from "react"
import { Outlet } from "react-router"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"

export function AppShell() {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <TopBar />
          <main id="contenido" className="flex-1 p-3 md:p-5">
            <Suspense
              fallback={
                <div
                  className="flex flex-col gap-4"
                  aria-busy="true"
                  aria-label="Cargando"
                >
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </SidebarInset>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  )
}
