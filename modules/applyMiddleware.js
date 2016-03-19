import { cloneElement } from 'react'

const applyMiddleware = (...middleware) => {
  // middleware looks like: { renderContainer, renderRootContainer }
  const withRootContainer = middleware.filter(m => m.renderRootContainer)
  const withContainer = middleware.filter(m => m.renderContainer)

  const createElement = withContainer.reduceRight((previous, { renderContainer }) => (
    (RouteComponent, props) => {
      const element = renderContainer(RouteComponent, props)
      return previous ? cloneElement(element, { createElement: previous }) : element
    }
  ), null)

  return withRootContainer.reduceRight((previous, { renderRootContainer }) => (
    (renderProps) => {
      const element = renderRootContainer(renderProps)
      return previous ? (
        cloneElement(element, { render: previous })
      ) : (
        cloneElement(element, { createElement })
      )
    }
  ), null)
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

