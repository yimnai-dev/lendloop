import { todayIn, type IsoDate } from "~/shared/domain/IsoDate";
import { publicEnv } from "./env";

/**
 * "Today" in the neighborhood's time zone. Call only from components that
 * render after live data arrives (never during prerender), so reading the
 * clock is safe.
 */
export const today = (): IsoDate => todayIn(publicEnv.appTimeZone, Date.now());
