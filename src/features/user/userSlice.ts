import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getAddress } from "../../services/apiGeocoding";

import type { Position } from "../../types";
import type { PayloadAction } from "@reduxjs/toolkit";

function getPosition() {
  return new Promise<GeolocationPosition>(function (resolve, reject) {
    if (!navigator.geolocation) {
      reject(
        new Error("Location is not supported. Enter your address manually."),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10_000,
      maximumAge: 60_000,
    });
  });
}

export const fetchAddress = createAsyncThunk(
  "user/fetchAddress",
  async function () {
    const geolocation = await getPosition();
    const position = {
      latitude: geolocation.coords.latitude,
      longitude: geolocation.coords.longitude,
    };

    const result = await getAddress(position);
    const address = [
      ...new Set(
        [
          result.locality,
          result.city,
          result.postcode,
          result.countryName,
        ].filter(Boolean),
      ),
    ].join(", ");

    if (!address) {
      throw new Error("No address was found. Enter it manually.");
    }

    return { position, address };
  },
);

type UserState = {
  username: string;
  status: "idle" | "loading" | "error";
  position?: Position;
  address: string;
  error: string;
};

const initialState: UserState = {
  username: "",
  status: "idle",
  address: "",
  error: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateName(state, action: PayloadAction<string>) {
      state.username = action.payload.trim();
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = "idle";
      })
      .addCase(fetchAddress.rejected, (state) => {
        state.status = "error";
        state.error =
          "There was a problem getting your address. Make sure to fill this field!";
      }),
});

export default userSlice.reducer;

export const { updateName } = userSlice.actions;

export const getUsername = (state: { user: { username: string } }) =>
  state.user.username;
