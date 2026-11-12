import * as Effect from "effect/Effect";

type Page<A> = { readonly page: ReadonlyArray<A> };

/** Turns a page of documents into a page of views, keeping the cursor fields as they are. */
export const mapPage = <P extends Page<A>, A, B, E, R>(
  result: P & Page<A>,
  toView: (doc: A) => Effect.Effect<B, E, R>,
) => Effect.map(Effect.forEach(result.page, toView), (page) => ({ ...result, page }));
