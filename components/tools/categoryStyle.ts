import {
  ChefHatIcon,
  DrillIcon,
  HammerIcon,
  type LucideIcon,
  MountainIcon,
  ShovelIcon,
  SprayCanIcon,
  TentIcon,
  WrenchIcon,
} from "lucide-react";
import type { Category } from "~/shared/domain/Category";

/** One icon and one tint per category, so tools are recognizable without photos. */
export const categoryStyle = {
  power_tools: {
    Icon: DrillIcon,
    tint: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  hand_tools: {
    Icon: HammerIcon,
    tint: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  },
  garden: {
    Icon: ShovelIcon,
    tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  kitchen: {
    Icon: ChefHatIcon,
    tint: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
  camping: {
    Icon: TentIcon,
    tint: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  },
  cleaning: {
    Icon: SprayCanIcon,
    tint: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  outdoor: {
    Icon: MountainIcon,
    tint: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300",
  },
  other: {
    Icon: WrenchIcon,
    tint: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
} as const satisfies Record<Category, { Icon: LucideIcon; tint: string }>;
