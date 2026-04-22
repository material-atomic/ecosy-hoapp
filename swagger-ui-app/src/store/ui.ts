import { createSlice, type PayloadAction } from "@ecosy/store";

type URLItem = string;
export type BaseURL = string;
export type OpeningItem = Record<BaseURL, URLItem[]>;

export type SidebarViewType = "tags" | "tree";

export interface UIState {
  selectedUrl: BaseURL;
  openingItems: OpeningItem;
  activeItems: Record<BaseURL, URLItem>;
  sidebarViewType: SidebarViewType;
}

const initialState: UIState = {
  selectedUrl: "",
  openingItems: {},
  activeItems: {},
  sidebarViewType: "tags",
};

export const uiSchema = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedUrl(state, action: PayloadAction<BaseURL>) {
      state.selectedUrl = action.payload;
    },
    setSidebarViewType(state, action: PayloadAction<SidebarViewType>) {
      state.sidebarViewType = action.payload;
    },
    addOpeningItem(state, action: PayloadAction<URLItem, string, BaseURL>) {
      const url = action.meta;
      const id = action.payload;
      if (!state.openingItems[url]) {
        state.openingItems[url] = [];
      }

      if (!state.openingItems[url].includes(id)) {
        state.openingItems[url].push(id);
      }
      state.activeItems[url] = id;
    },
    setActiveItem(state, action: PayloadAction<URLItem, string, BaseURL>) {
      state.activeItems[action.meta] = action.payload;
    },
    removeOpeningItem(state, action: PayloadAction<URLItem, string, BaseURL>) {
      const url = action.meta;
      const id = action.payload;
      const items = state.openingItems[url];
      
      if (items) {
        const index = items.indexOf(id);
        if (index > -1) {
          items.splice(index, 1);
          
          if (state.activeItems[url] === id) {
            if (items.length > 0) {
              const nextIndex = Math.min(index, items.length - 1);
              state.activeItems[url] = items[nextIndex];
            } else {
              delete state.activeItems[url];
            }
          }
        }
      }
    }
  }
});

export const uiAction = uiSchema.actions;
