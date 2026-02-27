import { describe, expect, it } from "vitest";

import reducer, {
  fetchAddress,
  getUsername,
  updateName,
} from "../../../../features/user/userSlice";

describe("userSlice", () => {
  it("selects username from root state", () => {
    const state = {
      user: {
        username: "Valentin",
      },
    };

    expect(getUsername(state)).toBe("Valentin");
  });

  it("updates username", () => {
    const state = reducer(undefined, updateName("Valentin"));
    expect(state.username).toBe("Valentin");
  });

  it("handles fetchAddress pending", () => {
    const state = reducer(undefined, fetchAddress.pending("request-id"));
    expect(state.status).toBe("loading");
  });

  it("handles fetchAddress fulfilled", () => {
    const payload = {
      position: { latitude: 42.6977, longitude: 23.3219 },
      address: "Sofia, Sofia 1000, Bulgaria",
    };

    const state = reducer(
      undefined,
      fetchAddress.fulfilled(payload, "request-id"),
    );

    expect(state.status).toBe("idle");
    expect(state.position).toEqual(payload.position);
    expect(state.address).toBe(payload.address);
  });

  it("handles fetchAddress rejected", () => {
    const state = reducer(undefined, fetchAddress.rejected(null, "request-id"));
    expect(state.status).toBe("error");
    expect(state.error).toBe(
      "There was a problem getting your address. Make sure to fill this field!",
    );
  });
});
