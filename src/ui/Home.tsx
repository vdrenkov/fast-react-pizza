import { Link } from "react-router";

import CreateUser from "../features/user/CreateUser";
import { getUsername } from "../features/user/userSlice";
import { useAppSelector } from "../hooks";
import Button from "./Button";

export default function Home() {
  const username = useAppSelector(getUsername);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> Good food. No fuss.
          </p>
          <h1>
            A good day
            <br />
            starts with
            <br />
            <em>great pizza.</em>
          </h1>
          <p className="hero-description">
            Pick your favourite. Make it yours. We’ll take it from the oven to
            your door.
          </p>
          {username ? (
            <Button to="/menu" type="primary">
              Continue ordering, {username} ↗
            </Button>
          ) : (
            <CreateUser />
          )}
          <p className="hero-note">
            Just browsing?{" "}
            <Link to="/menu" className="text-link">
              Explore the menu →
            </Link>
          </p>
        </div>
        <div className="hero-art">
          <div className="hero-circle" />
          <img
            src="https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/pizzas/pizza-1.jpg"
            alt="Margherita pizza with tomato, mozzarella and fresh basil"
            width={600}
            height={600}
            fetchPriority="high"
          />
          <div className="hero-stamp">
            <span>THE CLASSIC</span>
            <strong>Margherita</strong>
            <span>Simple for a reason.</span>
          </div>
          <span className="hero-caption">YOUR NEXT FAVOURITE SLICE ↗</span>
        </div>
      </section>
      <section className="home-details" aria-label="How it works">
        <div>
          <span>01</span>
          <h2>Find your favourite</h2>
          <p>Classic combinations and something a little different.</p>
        </div>
        <div>
          <span>02</span>
          <h2>Make it a meal</h2>
          <p>A solo slice kind of evening or enough for the whole table.</p>
        </div>
        <div>
          <span>03</span>
          <h2>Follow your order</h2>
          <p>Keep your order number handy and check its progress.</p>
        </div>
      </section>
    </>
  );
}
