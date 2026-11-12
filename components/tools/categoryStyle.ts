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

/** One line icon per category, so tools read clearly even without a photo. */
export const categoryIcon = {
  power_tools: DrillIcon,
  hand_tools: HammerIcon,
  garden: ShovelIcon,
  kitchen: ChefHatIcon,
  camping: TentIcon,
  cleaning: SprayCanIcon,
  outdoor: MountainIcon,
  other: WrenchIcon,
} as const satisfies Record<Category, LucideIcon>;
