import { cloneElement } from 'react'
import React from 'react'
import RouterContext from 'react-router/lib/RouterContext'

const applyMiddleware = (...middleware) => {
  // middleware looks like: { renderContainer, renderRootContainer }
  const withRootContainer = middleware.filter(m => m.renderRootContainer)
  const withContainer = middleware.filter(m => m.renderContainer)

  const finalCreateElement = (Component, props) => <Component {...props}/>

  const createElement = withContainer.reduceRight((previous, { renderContainer }) => (
    (RouteComponent, props) => (
      cloneElement(
        renderContainer(RouteComponent, props),
        { createElement: previous }
      )
    )
  ), finalCreateElement)

  const finalRenderRootContainer = (renderProps) => (
    <RouterContext {...renderProps} createElement={createElement}/>
  )

  return withRootContainer.reduceRight((previous, { renderRootContainer }) => (
    (renderProps) => (
      cloneElement(
        renderRootContainer(renderProps),
        { render: previous }
      )
    )
  ), finalRenderRootContainer)
}

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

