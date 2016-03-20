# React Router Apply Middleware

Compose behavior in the render lifecycle of React Router apps.

A name other than "middleware" would be awesome, I just can't think of
one. Please suggest.

## Installation

```
npm install react-router-apply-middleware
```

## Usage

```js
import applyRouterMiddleware from 'react-router-apply-middleware'
import { useAsyncProps } from 'react-router-async-props'
import { useRelativeLinks } from 'react-router-relative-links'
import { useNamedRoutes } from 'react-router-named-routes'
import routes from './routes'

const renderWithMiddleware = applyRouterMiddleware(
  useAsyncProps(),
  useRelativeLinks(),
  useNamedRoutes(routes)
)

render(<Router render={renderWithMiddleware} routes={routes}/>, el)
```

## Writing Middleware

For now you'll have to look at the tests, it's a little bit tricky. As
soon as the middleware libs I'm working on are updated, I'll come add
some notes here about how to do it.

Hopefully we'll end up with stuff like:

```js
useRelay(rootId)
useAlt()
useTransit()
useGroundControl(store)
useScrollBehavior()
```

etc.

