# Provide Nested Set State

Rendering nested state in React is quite easy. Updating nested state on the other side is quite complicated.

This library provides a simple way to update nested state in React.

```tsx
import { JSX, useState } from "react";
import { SetState, provideNestedSetState } from "provide-nested-set-state";

export interface Sight {
  name: string;
  rating: number; // Rating from 1 to 10
  comment: string;
  coordinates: string;
}

export interface City {
  name: string;
  inhabitants: number;
  airport: boolean;
  sights: Sight[];
}

const stockholm: City = {
  name: "Stockholm",
  inhabitants: 975000,
  airport: true,
  sights: [
    {
      name: "Vasa Museum",
      rating: 9,
      comment: "A must-visit museum with an incredible ship.",
      coordinates: "59.3289° N, 18.0914° E",
    },
    {
      name: "Skansen",
      rating: 8,
      comment: "Open-air museum showcasing Swedish history.",
      coordinates: "59.3274° N, 18.1048° E",
    },
  ],
};

export const TextArea = ({
  setText,
  text,
}: {
  text: string;
  setText: SetState<string>;
}): JSX.Element => {
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
        cols="50"
      />
    </div>
  );
};

type SightProps = {
  sight: Sight;
  setSight: SetState<Sight>;
};

const Sight = ({ sight, setSight }: SightProps): JSX.Element => {
  function changeRating(rating: number): void {
    setSight((prevSight) => {
      return { ...prevSight, rating };
    });
  }

  return (
    <div>
      <h3>{sight.name}</h3>
      <p>
        <button onClick={() => changeRating(sight.rating - 1)}>-</button>{" "}
        Rating: {sight.rating}{" "}
        <button onClick={() => changeRating(sight.rating + 1)}>+</button>
      </p>
      <p>Comment: {sight.comment}</p>
      <TextArea
        text={sight.comment}
        setText={provideNestedSetState(setSight, "comment")}
      />
      <p>Coordinates: {sight.coordinates}</p>
    </div>
  );
};

export const City = (): JSX.Element => {
  const [city, setCity] = useState<City>(stockholm);
  return (
    <div>
      <h2>{city.name}</h2>
      <p>Inhabitants: {city.inhabitants}</p>
      <p>Airport: {city.airport ? "Yes" : "No"}</p>
      <ul>
        {city.sights.map((sight, index) => {
          return (
            <Sight
              sight={sight}
              key={index}
              setSight={provideNestedSetState(setCity, "sights", index)}
            />
          );
        })}
      </ul>
    </div>
  );
};
```
