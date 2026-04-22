import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/login",
  summary: "Admin Login",
  tags: ["System Auth"],
  responses: {
    200: { description: "Successfully logged in admin" },
    401: { description: "Invalid credentials provided" }
  },
  examples: {
    "valid-login": {
      summary: "Valid Credentials",
      value: { username: "admin", password: "password123" }
    }
  }
}).use(() => ({ token: "sys-admin-token-123" }));
