import { describe, expect, it } from "vitest";
import { isValidPin } from "@/components/bank/customer/PinGate";
describe("security PIN rule", () => {
  it("accepts exactly 6 digits", () => expect(isValidPin("482913")).toBe(true));
  it("rejects shorter PINs", () => expect(isValidPin("12345")).toBe(false));
  it("rejects letters", () => expect(isValidPin("12a456")).toBe(false));
});
