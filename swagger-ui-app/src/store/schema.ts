import { createSlice } from "@ecosy/store";

export interface SwaggerSchema {
  urls: string[];
}

const initialState: SwaggerSchema = {
  urls: ["http://localhost:8787"],
};

export const schemaSlice = createSlice({
  name: "schema",
  initialState,
  reducers: {}
});
