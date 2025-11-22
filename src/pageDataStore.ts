import { create } from "zustand";
import type { PageData } from "@deepsel/cms-utils";

type PageDataStore = {
  pageData: PageData | null;
  initialized: boolean;
  initialize: (initial: PageData) => void;
  setPageData: (updater: PageData | ((prev: PageData) => PageData)) => void;
};

export const usePageDataStore = create<PageDataStore>((set) => ({
  pageData: null,
  initialized: false,
  initialize: (initial) =>
    set((state) =>
      state.initialized ? state : { pageData: initial, initialized: true }
    ),
  setPageData: (updater) =>
    set((state) => {
      if (!state.pageData) return state;
      const next =
        typeof updater === "function"
          ? (updater as (prev: PageData) => PageData)(state.pageData)
          : updater;
      return { ...state, pageData: next };
    }),
}));

// Convenience hook that can optionally seed the store
export function usePageData(initial?: PageData) {
  const state = usePageDataStore();

  if (!state.initialized && initial) {
    // Synchronously seed the store on first use
    usePageDataStore.setState({
      pageData: initial,
      initialized: true,
    });
    return { ...state, pageData: initial, initialized: true };
  }

  return state;
}
