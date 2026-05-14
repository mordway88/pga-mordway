import { BarChart3, Trophy } from "lucide-react";

const navItems = [
  { id: "pool", label: "Pool Standings", icon: Trophy },
  { id: "tournament", label: "Tournament", icon: BarChart3 },
];

export function NavTabs({ activeView, onChange }) {
  return (
    <nav className="z-40">
      <div className="flex gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-condensed text-sm font-bold uppercase tracking-[0.1em] transition sm:px-4 ${
                isActive
                  ? "gold-sheen text-emerald-950 shadow-[0_0_24px_rgba(252,211,77,.18)]"
                  : "bg-white/[0.08] text-white/78 hover:bg-white/[0.13] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
