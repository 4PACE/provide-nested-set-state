# Provide Nested Set State

React makes it very easy to render nested state. 
Yet updating nested state is surprisingly complicated. 
This library provides a simple, performant and type safe way to update nested state in React child 
components. 

Impatient? Check the <a href="https://stackblitz.com/edit/pnss-city-example?file=src%2FCity.tsx">City demo</a>.



// TODO table of contents

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

provideNestedSetState can be used with setState functions that were created with provideNestedSetState.
This allows you to update deeply nested state in a type safe way.

see TravelList in the examples folder 

### Usage with objects, arrays and primitives

## Performance Considerations

provideNestedSetState provides memoization for the returned setState function.
This means that the returned setState function will only be recreated when 

Consider using memo() from React to memoize the Child components.

## Interop with other libraries
jotai
??zustand
??recoil
??redux
??mobx
?immer

## Limitations
Currently the `provideNestedSetState` can be used "only" seven levels deep. This should cover any
sane use case for state management. Seven levels is for example `obj.a.b.c.d.e.f.g` or `obj.a[1].c[0].e[5].g`
or `arr[0][1][2][3][4][5][6]`. Data that deep or even deeper might indicate a need to refactor. 
If you really want / have to go there you can 

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

