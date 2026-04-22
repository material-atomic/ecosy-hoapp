import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Get Profile",
  tags: ["Web Profile"],
  bearer: true,
  responses: {
    200: { description: "Returns authenticated user data" },
    401: { description: "Missing or invalid bearer token" }
  },
  examples: {
    "profile-success": {
      summary: "Successful Profile Data",
      value: { username: "john", email: "john@example.com" }
    }
  }
}).use(() => ({ username: "john", email: "john@example.com" }));
