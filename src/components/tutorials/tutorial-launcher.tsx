/**
 * Tutorial Launcher
 *
 * Slide-out panel that lists available tutorials grouped by category.
 * Shows completion status and progress and is opened from page actions.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../../design-system";
import { useTutorial } from "../../hooks/use-tutorial";
import type { Tutorial, TutorialCategory } from "../../constants/tutorials";

// --- Category icons ---

const CATEGORY_ICONS: Record<TutorialCategory, React.ReactNode> = {
  "getting-started": <BookOpen className="w-4 h-4" />,
  ordering: <Play className="w-4 h-4" />,
  storefront: <BookOpen className="w-4 h-4" />,
  wallet: <BookOpen className="w-4 h-4" />,
  commissions: <BookOpen className="w-4 h-4" />,
  admin: <BookOpen className="w-4 h-4" />,
};

// --- Component ---

export const TutorialLauncher: React.FC = () => {
  const {
    isLauncherOpen,
    setLauncherOpen,
    tutorialsByCategory,
    categoryLabels,
    availableTutorials,
    startTutorial,
    isCompleted,
    resetTutorial,
    completedCount,
    totalCount,
    activeTutorial,
    resetAllTutorials,
  } = useTutorial();

  const navigate = useNavigate();
  const location = useLocation();
  const [pendingTutorialId, setPendingTutorialId] = React.useState<
    string | null
  >(null);

  const handleLaunchTutorial = (tutorial: Tutorial) => {
    const routeToOpen = tutorial.startRoute ?? tutorial.targetRoutes[0];
    if (routeToOpen && !location.pathname.startsWith(routeToOpen)) {
      setPendingTutorialId(tutorial.id);
      setLauncherOpen(false);
      navigate(routeToOpen);
      return;
    }

    startTutorial(tutorial.id);
    setLauncherOpen(false);
  };

  React.useEffect(() => {
    if (!pendingTutorialId) return;
    const tutorial = availableTutorials.find((t) => t.id === pendingTutorialId);
    if (!tutorial) {
      setPendingTutorialId(null);
      return;
    }

    const routeToOpen = tutorial.startRoute ?? tutorial.targetRoutes[0];
    if (routeToOpen && location.pathname.startsWith(routeToOpen)) {
      startTutorial(pendingTutorialId);
      setPendingTutorialId(null);
    }
  }, [location.pathname, pendingTutorialId, availableTutorials, startTutorial]);

  // Render the panel only when explicitly opened and not already playing a tutorial
  if (activeTutorial || !isLauncherOpen) return null;

  return (
    <>
      {/* Slide-out panel */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
        onClick={() => setLauncherOpen(false)}
      />

      {/* Panel */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 text-[var(--color-text)]">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-primary-600)]" />
              <h2 className="font-semibold text-[var(--color-text)]">
                Tutorials
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                colorScheme={completedCount === totalCount ? "success" : "info"}
                size="xs"
                variant="subtle"
              >
                {completedCount}/{totalCount} done
              </Badge>
              {completedCount > 0 && (
                <button
                  onClick={resetAllTutorials}
                  className="text-xs text-[var(--color-muted-text)] hover:text-[var(--color-text)] transition"
                  title="Reset all tutorials"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 h-1.5 bg-[var(--color-control-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500"
              style={{
                width:
                  totalCount > 0
                    ? `${(completedCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        {/* Tutorial list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {(
            Object.entries(tutorialsByCategory) as [
              TutorialCategory,
              (typeof tutorialsByCategory)[TutorialCategory],
            ][]
          ).map(([category, tutorials]) => (
            <div key={category}>
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <span className="text-[var(--color-muted-text)]">
                  {CATEGORY_ICONS[category]}
                </span>
                <h3 className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide">
                  {categoryLabels[category]}
                </h3>
              </div>

              <div className="space-y-1.5">
                {tutorials.map((tutorial) => {
                  const done = isCompleted(tutorial.id);
                  return (
                    <button
                      key={tutorial.id}
                      onClick={() => handleLaunchTutorial(tutorial)}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-control-bg)] active:bg-[var(--color-control-bg)] transition group"
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          done
                            ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                            : "bg-[var(--color-primary-50)] text-[var(--color-primary-600)]"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            done
                              ? "text-[var(--color-muted-text)]"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {tutorial.title}
                        </p>
                        <p className="text-xs text-[var(--color-muted-text)] truncate">
                          {tutorial.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {tutorial.estimatedMinutes && (
                          <span className="text-[10px] text-[var(--color-muted-text)] flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {tutorial.estimatedMinutes}m
                          </span>
                        )}
                        {done ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetTutorial(tutorial.id);
                            }}
                            className="text-[var(--color-muted-text)] hover:text-[var(--color-text)] p-1 transition opacity-0 group-hover:opacity-100"
                            title="Reset this tutorial"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--color-gray-300)] group-hover:text-[var(--color-muted-text)] transition" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-muted-text)]">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-[var(--color-control-bg)] rounded text-[10px] font-mono text-[var(--color-text)]">
                ?
              </kbd>{" "}
              anytime to open tutorials
            </p>
            <button
              onClick={() => setLauncherOpen(false)}
              className="text-xs text-[var(--color-muted-text)] hover:text-[var(--color-text)] transition flex items-center gap-1"
              title="Close tutorials"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialLauncher;
