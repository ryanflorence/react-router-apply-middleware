# React Router Apply Middleware

This is a WIP with only a couple hours put into the code, but I think it
works, give it a shot, send some pull requests if you run into issues.

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

