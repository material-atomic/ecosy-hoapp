import { createSlice, type PayloadAction } from "@ecosy/store";

export interface AuthState {
  basic: {
    username?: string;
    password?: string;
  };
  bearer: {
    token?: string;
  };
}

const initialState: AuthState = {
  basic: {},
  bearer: {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setBasicAuth(state, action: PayloadAction<{ username?: string; password?: string }>) {
      state.basic = action.payload;
    },
    setBearerAuth(state, action: PayloadAction<{ token?: string }>) {
      state.bearer = action.payload;
    },
  },
});

export const authActions = authSlice.actions;
