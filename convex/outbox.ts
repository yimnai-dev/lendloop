import registeredFunctions from "../confect/_generated/registeredFunctions/outbox";

export const dispatch = registeredFunctions.dispatch;
export const load = registeredFunctions.load;
export const recordFailure = registeredFunctions.recordFailure;
export const recordSuccess = registeredFunctions.recordSuccess;
export const sweep = registeredFunctions.sweep;
