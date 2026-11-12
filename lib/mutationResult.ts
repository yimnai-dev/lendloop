import * as Result from "effect/Result";
import { toast } from "sonner";
import { describeError, type AppError } from "./errors";

/** Toasts the outcome of a typed Confect mutation and hands the result back. */
export const toastResult = async <A, E extends AppError>(
  pending: Promise<Result.Result<A, E>>,
  success: string,
): Promise<Result.Result<A, E>> => {
  const result = await pending;
  if (Result.isSuccess(result)) toast.success(success);
  else toast.error(describeError(result.failure));
  return result;
};
