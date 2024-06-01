# Provide Nested Set State

React makes it very easy to render nested state. 
Yet updating nested state is surprisingly complicated. 
This library provides a simple, performant and type safe way to update nested state in React child 
components. 

// TODO should this part go into discussion?

The official React documentation recommends to [Avoid deeply nested state](
https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state). Stating that 
_Updating nested state involves making copies of objects all the way up from the part that changed._
This is where provide-nested-set-state comes in.

provide-nested-set-state is a small library that provides a function `provideNestedSetState` 

updating nested state manually is a tedious task and leads to tight coupling between components.

The official React documentation recommends to us flattened state. But flattened state 
can become difficult to understand and maintain.



// TODO table of contents

## Installation

```bash
npm install provide-nested-set-state
```

```bash
yarn install provide-nested-set-state
```

## Usage

The easiest and built-in way to keep state in React is by using the useState hook. 
It provides the current state and a function to update the state, the setState function.
This library provides a function `provideNestedSetState` that takes a setState function provided by 
useState and a path to the nested state you want to update. It returns a new setState function that
you can use in child components to update the nested state.

### Basic Example

```tsx
import { JSX, useState } from "react";
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
  // it returns a new setState function that can be used to update the nested state
  const nestedSetState: SetState<number> = provideNestedSetState(setState, "nested", "value");
  return (
    <div>
      <p>{state.nested.value}</p>
      <button onClick={() => nestedSetState(prev => prev + 1)}>Increment</button>
    </div>
  )
}
```

### Detailed Example

`provideNestedSetState` provides its greatest advantage when used for deeply nested components, 
simplifying state management and ensuring type safety.

You can copy and paste this example into your project to see how it works. 
Create a City.tsx file and add the <City /> component to your App component.
Or check the examples folder in the repository.

```tsx
import { JSX, useState } from "react";
// SetState<T> is a type alias for Dispatch<SetStateAction<T>>, 
// the type of the function returned by useState
// it just makes typing a bit easier
import { SetState, provideNestedSetState } from "provide-nested-set-state";

type City = {
  name: string;
  inhabitans: number;
  sights: Sight[];
};

type Sight = {
  name: string;
  rating: number; // Rating from 1 to 10
  comment: string;
};

export const City = (): JSX.Element => {
  const [city, setCity] = useState<City>({
    name: "Göteborg",
    inhabitans: 597_000 ,
    sights: [
      {
        name: "Liseberg",
        rating: 9,
        comment: "A must-visit amusement park.",
      },
      {
        name: "Universeum",
        rating: 8,
        comment: "Science center with a rainforest and aquarium.",
      },
    ],
  });
  return <div>
    <h1>{city.name}</h1>
    <p>Inhabitants: {city.inhabitants}</p>
    <h2>Sights</h2>
    {city.sights.map((sight, index) => {
      // Provide the setState function to the nested Sight component
      // the first param is the parent setState, the following params are the keys of the path to the nested state
      // the path is type safe, try to change the key to something else than "sights", you will get a type error
      // nestedSetState is of type SetState<Sight> but will update the full City state
      const nestedSetState: SetState<Sight> = provideNestedSetState(setCity, "sights", index);
      return (<Sight sight={sight} setSight={nestedSetState} key={index}/>
      );
    })}
  </div>
  
  const Sight = ({sight, setSight}: {sight: Sight, setSight: SetState<Sight>} ): JSX.Element => {
    function updateRating(rating: number) {
      // setSight is the setState function provided by provideNestedSetState
      // it is used just like the original setState function returned by useState
      // it only takes the nested state and updates the full parent state so the React components will rerender
      setSight({...sight, rating});
      // or you can use the callback version 
      // setSight((prevSight) => ({...prevSight, rating}));
    }
    return <div>
      <h3>{sight.name}</h3>
      <p>Rating: 
        <button onclick={() => updateRating(sight.rating - 1)}>-</button> 
        {sight.rating} 
        <button onclick={() => updateRating(sight.rating + 1)}>+</button></p>
      <p>Comment: {sight.comment}</p>
    </div>
  }
}
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
nesting "only" 7 levels deep

## FAQ
- Use with plain JavaScript
- How does provideNestedSetState change the state?
- Use with non serializable state
