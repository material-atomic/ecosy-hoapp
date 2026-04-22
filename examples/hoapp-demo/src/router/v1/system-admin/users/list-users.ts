import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "List Web Users",
  tags: ["System Web Users"],
  bearer: true,
  basic: true,
  responses: {
    200: { description: "Returns a paginated list of system users" },
    403: { description: "Admin lacks sufficient privileges" }
  },
  examples: {
    "default-response": {
      summary: "Default List",
      value: { items: [{ id: "u1", username: "john" }] }
    }
  }
}).use(() => [{ id: "u1", username: "john" }]);
