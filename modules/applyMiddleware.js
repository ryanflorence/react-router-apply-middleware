import { cloneElement } from 'react'
import React from 'react'
import RouterContext from 'react-router/lib/RouterContext'

const applyMiddleware = (...middleware) => (
  ((createElement) => (
    middleware.filter(m => m.renderRootContainer).reduceRight(
      (previous, { renderRootContainer }) => (
        (renderProps) => (
          cloneElement(
            renderRootContainer(renderProps),
            { render: previous }
          )
        )
      ), (renderProps) => (
        <RouterContext {...renderProps} createElement={createElement}/>
      )
    )
  ))(middleware.filter(m => m.renderContainer).reduceRight(
    (previous, { renderContainer }) => (
      (RouteComponent, props) => (
        cloneElement(
          renderContainer(RouteComponent, props),
          { createElement: previous }
        )
      )
    ), (Component, props) => <Component {...props}/>
  ))
)

export default applyMiddleware

/*

`applyMiddleware` turns this:

```js
const render = applyMiddleware(
  useAsyncProps({ loadContext: { token } }),
  useNamedRoutes(),
  useRelativeLinks()
)
```

into this:

```js
<Router
  render={(props) => (
    <AsyncProps {...props}
      render={(props) => (
        <NamedRoutes {...props}
          render={(props) => (
            <RelativeLinks {...props}
              createElement={(Component, props) => (
                <AsyncPropsContainer Component={Component} routerProps={props} token={token}
                  createElement={(Component, props) => (
                    <RelativeLinksContainer Component={Component} routerProps={props}/>
                  )}
                />
              )}
            />
          )}
        />
      )}
    />
  )}
/>
```
*/

