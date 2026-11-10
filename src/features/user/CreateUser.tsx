import { useState } from "react";
import { useNavigate } from "react-router";

import { useAppDispatch } from "../../hooks";
import Button from "../../ui/Button";
import { updateName } from "./userSlice";

import type { SubmitEvent } from "react";

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = username.trim();

    if (!name) {
      return;
    }

    dispatch(updateName(name));
    void navigate("/menu");
  }

  return (
    <form onSubmit={handleSubmit} className="welcome-form">
      <label htmlFor="username">What should we call you?</label>
      <div className="welcome-fields">
        <input
          id="username"
          name="name"
          autoComplete="given-name"
          maxLength={60}
          placeholder="Your full name"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="input"
          required
        />
        <Button type="primary" submit disabled={!username.trim()}>
          Start ordering <span aria-hidden="true">↗</span>
        </Button>
      </div>
    </form>
  );
}
