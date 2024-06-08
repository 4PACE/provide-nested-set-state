# Provide Nested Set State

React makes it very easy to render nested state. Yet updating nested state is surprisingly
complicated. This library provides a simple, performant and type safe way to update nested state
in React child components.

![A gif showing type safety and auto complete for provideNestedSetState]("pNSS.gif")

Impatient? Check the <a href="https://stackblitz.com/edit/pnss-city-example?file=src%2FCity.tsx">City demo</a>.

## Installation

Install it using your favorite package manager.
```bash
npm install provide-nested-set-state
```

```bash
yarn install provide-nested-set-state
```

## Usage

The easiest and built-in way to keep state in React is by using the useState hook.
It provides the current state and a function to update the state.
This library provides a function `provideNestedSetState` that takes the setState function provided by
useState hook and a path to the nested state you want to update.
It returns a new setState function that you can use in child components to update the nested state.
The parent state will automatically be updated accordingly causing the components using the state to update.

### Basic Example

```tsx
import { JSX, useState } from "react";
// The type SetState<T> is just a convenient alias for Dispatch<SetStateAction<T>>, 
// the type of the update function returned by the useState hook 
import { SetState, provideNestedSetState } from "provide-nested-set-state";

export const MyComponent = (): JSX.Element => {
  const [state, setState] = useState(
    {
      nested: {
        value: 0
      }
    }
  );
  
  // provideNestedSetState takes the parent setState function and the path to the nested state
  // as strings and / or numbers, this path is type safe
  // it returns a new setState function that can be used to update the nested state
  const nestedSetState: SetState<number> = provideNestedSetState(setState, "nested", "value");
  return (
    <div>
      <p>{state.nested.value}</p>
      <button onClick={() => nestedSetState(prev => prev + 1)}>Increment</button>
      <button onClick={() => nestedSetState(0)}>Reset</button>
    </div>
  )
}
```

### Detailed Example

`provideNestedSetState` provides its greatest advantage when used for deeply nested components,
simplifying state management and ensuring type safety.

You can copy and paste this example into your project to see how it works.
Create a `City.tsx` file and add the <City /> component to your App component.
You can also check the examples folder in the repository or test
<a href="https://stackblitz.com/edit/pnss-city-example?file=src%2FCity.tsx">City demo</a>
directly in your browser.

```tsx
import { JSX, useState } from 'react';
// SetState<T> is a type alias for Dispatch<SetStateAction<T>>,
// the type of the function returned by useState
// it just makes typing a bit easier
import { SetState, provideNestedSetState } from 'provide-nested-set-state';

// The root state
type City = {
  name: string;
  inhabitants: number;
  sights: Sight[];
};

// The nested state, two steps down, e.g. `myCity.sights[3]`
type Sight = {
  name: string;
  rating: number; // Rating from 1 to 10
  comment: string;
};

// The root component
export const City = (): JSX.Element => {
  const [city, setCity] = useState<City>({
    name: 'Göteborg',
    inhabitants: 597_000,
    sights: [
      {
        name: 'Liseberg',
        rating: 9,
        comment: 'A must-visit amusement park.',
      },
      {
        name: 'Universeum',
        rating: 8,
        comment: 'Science center with a rainforest and aquarium.',
      },
    ],
  });
  return (
    <div>
      <h1>{city.name}</h1>
      <p>Inhabitants: {city.inhabitants}</p>
      <h2>Sights</h2>
      {city.sights.map((sight, index) => {
        // Provide the setState function to the nested Sight component
        // the first param is the parent setState, the following params are the keys of the path to the nested state
        // the path is type safe, try to change the key to something else than "sights", you will get a type error
        // nestedSetState is of type SetState<Sight> but will update the full City state
        const nestedSetState: SetState<Sight> = provideNestedSetState(
          setCity,
          'sights',
          index
        );
        return <Sight sight={sight} setSight={nestedSetState} key={index} />;
      })}
      <hr />
      <code>
        <h3>The city state (the only state used):</h3>
        {JSON.stringify(city, null, 2)}
      </code>
    </div>
  );
};

// The child component using the nested state and a nested set state
const Sight = ({
  sight,
  setSight,
}: {
  sight: Sight;
  setSight: SetState<Sight>;
}): JSX.Element => {
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // setSight is the setState function provided by provideNestedSetState
    // it is used just like the original setState function returned by useState
    // it only takes the nested state and updates the full parent state so the React components will rerender
    setSight({ ...sight, comment: e.target.value });
  }

  function updateRating(ratingChange: number) {
    // you can also pass a callback function to get hold of the previous state
    setSight((prev) => ({ ...sight, rating: prev.rating + ratingChange }));
  }

  return (
    <div>
      <h3>{sight.name}</h3>
      <div className="box">
        <p>
          Rating:
          <button onClick={() => updateRating(-1)}>-</button>
          {sight.rating}
          <button onClick={() => updateRating(+1)}>+</button>
        </p>
        <p>Comment: {sight.comment}</p>
        <textarea
          value={sight.comment}
          onChange={handleInput}
          rows={3}
          cols={25}
        />
      </div>
    </div>
  );
};
```
By using provideNestedSetState directly as the value for the setSight prop, you can further simplify
your code and eliminate the need for an intermediate variable.

```tsx
{city.sights.map((sight, index) => 
      <Sight sight={sight} setSight={provideNestedSetState(setCity, "sights", index)} key={index}/>
      
    )}
```

### Usage with deeply nested state

`provideNestedSetState` can be used with setState functions that were created with provideNestedSetState.
This allows you to update deeply nested state in a type safe way. You can use this to pass a nested
setState to a child component and pass deeper nested setState functions to its grandchild components.

```tsx
export const MyComponent = (): JSX.Element => {
  const [state, setState] = useState(
    {
      nested1: {
        nested2: [
          { nested4: 0 }
        ]
      }
    }
  );
  
  const nested1SetState = provideNestedSetState(setState, "nested1");
  const nested2SetState = provideNestedSetState(setState, "nested2");
  const nested3SetState = provideNestedSetState(setState, 0);
  const nested4SetState = provideNestedSetState(setState, "nested4");
  return (
    <div>
      <p>{state.nested1.nested2[0].nested4}</p>
      <button onClick={() => nested4SetState(prev => prev + 1)}>Increment</button>
      <button onClick={() => nested4SetState(0)}>Reset</button>
    </div>
  )
}
```

## Performance Considerations

Using `provideNestedSetState` in a root component and passing the new setState functions down the
component tree, will cause all child components of the tree to rerender when a state in a child
component is changed. For small data sets this is not a problem. But very long lists or deeply
nested trees may become laggy due to the amount of rerenders. This is a common consideration in React
development and React offers a simple solution with the <a href="">memo</a> function.
From the documentation:
> React normally re-renders a component whenever its parent re-renders. With memo, you can create a
> component that React will not re-render when its parent re-renders so long as its new props are
> the same as the old props.

The setState function provided by provideNestedSetState comes memoized out-of-the-box and
is referentially stable, meaning it remains consistent across renders. By leveraging memoization,
you can ensure that components only re-render when necessary, greatly improving performance with
deeply nested or large data sets.

## Limitations
Currently, the `provideNestedSetState` can be used "only" seven levels deep. This should cover any
sane use case for state management. Seven levels is for example `obj.a.b.c.d.e.f.g` or `obj.a[1].c[0].e[5].g`
or `arr[0][1][2][3][4][5][6]`. Data that deep or even deeper might indicate a need to refactor.
If you really want to / have to go there you can call `provideNestedSetState` seven levels deep and
call it again on the resulting function.
```typescript
const sevenLevelsDeep = provideNestedSetState(setState, "a", "b", "c", "d", "e", "f", "g",);
const evenDeeperStill = provideNestedSetState(sevenLevelsDeep, "h", "h", "i");
```

## FAQ
- _Can I use `provideNestedSetState` with plain JavaScript?_
  Sure. Usage in plain JavaScript is the same. You will lose the type safety of course.


- _How does `provideNestedSetState` change the state?_
  `provideNestedSetState` will not modify the state at all until called. Under the hood it returns
  a function that - once it is called - will call the original setState and provide it with what you
  called it with, updating the original state using the path you provided.


- _Can I use `provideNestedSetState` with non-serializable state?_
  No, `provideNestedSetState` supports only serializable state. That is literal objects
  (`{}`), arrays (`[]`), number, string, boolean. 

