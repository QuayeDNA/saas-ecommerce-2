import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import "./App.css";
import { AppProvider } from "./providers/app-provider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CommissionProvider } from "./contexts/CommissionContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { StorefrontSessionProvider } from "./contexts/storefront-session-context";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { MaintenanceBanner } from "./components/maintenance-banner";
import { InstallPrompt } from "./components/install-prompt";
import { AnnouncementPopupHandler } from "./components/announcements/announcement-popup-handler";
import PushNotificationInitializer from "./components/PushNotificationInitializer";

function App() {
  const routeElement = useRoutes(routes);

  return (
    // StorefrontSessionProvider must wrap the entire app so the guard and
    // marker can communicate via context regardless of which route is active.
    <StorefrontSessionProvider>
      <>
        <ThemeProvider initialTheme="default">
          <ToastProvider>
            <AppProvider>
              <CommissionProvider>
                <NotificationProvider>
                  <AnnouncementProvider>
                    <PushNotificationInitializer />
                    <div className="min-h-screen flex flex-col">
                      <MaintenanceBanner />
                      <div className="flex-1">{routeElement}</div>
                      <NetworkStatusIndicator />
                      <InstallPrompt />
                      <AnnouncementPopupHandler />
                    </div>
                  </AnnouncementProvider>
                </NotificationProvider>
              </CommissionProvider>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </>
    </StorefrontSessionProvider>
  );
}

export default App;