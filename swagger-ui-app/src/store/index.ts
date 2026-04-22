import { combineSlices } from "@ecosy/store";
import { connectStore } from "@ecosy/react";
import { schemaSlice } from "./schema";
import { uiSchema } from "./ui";
import { openApisSlice } from "./openapis";
import { authSlice } from "./auth";
import { responsesSlice } from "./responses";

export const {
  store,
  dispatch,
  useSelector,
  useDispatch,
  getState,
} = connectStore({
  slices: combineSlices({
    schema: schemaSlice,
    ui: uiSchema,
    openApis: openApisSlice,
    auth: authSlice,
    responses: responsesSlice,
  }),
});