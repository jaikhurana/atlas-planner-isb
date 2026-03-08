import { Home, Globe, CalendarDays, PlusCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/global", icon: Globe, label: "Global" },
  { path: "/personal", icon: CalendarDays, label: "My Cal" },
  { path: "/create", icon: PlusCircle, label: "Create" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-200 ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <tab.icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  active ? "stroke-[2.5] scale-105" : "stroke-[1.5]"
                }`}
              />
              <span className={active ? "font-semibold" : ""}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
