import { createSlice, type PayloadAction } from "@ecosy/store";
import type { HttpResponse } from "@ecosy/core/http";

export interface EndpointResponse {
  result: HttpResponse | null;
  responseTime: number;
}

export type ResponsesState = Record<string, EndpointResponse>;

const initialState: ResponsesState = {};

export const responsesSlice = createSlice({
  name: "responses",
  initialState,
  reducers: {
    setResponse(state, action: PayloadAction<{ id: string; response: EndpointResponse }>) {
      state[action.payload.id] = action.payload.response;
    },
    clearResponse(state, action: PayloadAction<{ id: string }>) {
      delete state[action.payload.id];
    }
  },
});

export const responsesActions = responsesSlice.actions;
