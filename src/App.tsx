import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { AppShell } from "@/components/layout/app-shell"
import { FleetProvider } from "@/state/fleet-live"
import { SettingsProvider } from "@/state/settings"
const Dashboard = lazy(() => import("@/pages/Dashboard"))

const RoutePlanner = lazy(() => import("@/pages/RoutePlanner"))
const Orders = lazy(() => import("@/pages/Orders"))
const Fleet = lazy(() => import("@/pages/Fleet"))
const Analytics = lazy(() => import("@/pages/Analytics"))
const LiveMap = lazy(() => import("@/pages/LiveMap"))
const Settings = lazy(() => import("@/pages/Settings"))
const NotFound = lazy(() => import("@/pages/NotFound"))

export function App() {
  return (
    <SettingsProvider>
      <FleetProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="routes" element={<RoutePlanner />} />
              <Route path="orders" element={<Orders />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="live-map" element={<LiveMap />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FleetProvider>
    </SettingsProvider>
  )
}

export default App
