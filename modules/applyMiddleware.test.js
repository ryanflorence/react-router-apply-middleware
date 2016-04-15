/*eslint-env mocha*/
/*eslint no-console: 0*/
import expect from 'expect'
import React, { cloneElement } from 'react'
import { render } from 'react-dom'
import { Router, Route, createMemoryHistory } from 'react-router'
import applyMiddleware from './applyMiddleware'

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

const FOO_ROOT_CONTAINER_TEXT = 'FOO ROOT CONTAINER'
const BAR_ROOT_CONTAINER_TEXT = 'BAR ROOT CONTAINER'
const BAZ_CONTAINER_TEXT = 'BAZ INJECTED'

const FooRootContainer = React.createClass({
  propTypes: { children: React.PropTypes.node.isRequired },
  childContextTypes: { foo: React.PropTypes.string },
  getChildContext() { return { foo: FOO_ROOT_CONTAINER_TEXT } },
  render() {
    return this.props.children
  }
})

const FooContainer = React.createClass({
  propTypes: { children: React.PropTypes.node.isRequired },
  contextTypes: { foo: React.PropTypes.string.isRequired },
  render() {
    const { children, ...props } = this.props
    const fooFromContext = this.context.foo
    return cloneElement(children, { ...props, fooFromContext })
  }
})

const useFoo = () => ({
  renderRootContainer: (child) => (
    <FooRootContainer>{child}</FooRootContainer>
  ),
  renderContainer: (child) => (
    <FooContainer>{child}</FooContainer>
  )
})

const BarRootContainer = React.createClass({
  propTypes: { children: React.PropTypes.node.isRequired },
  childContextTypes: { bar: React.PropTypes.string },
  getChildContext() { return { bar: BAR_ROOT_CONTAINER_TEXT } },
  render() {
    return this.props.children
  }
})

const BarContainer = React.createClass({
  propTypes: { children: React.PropTypes.node.isRequired },
  contextTypes: { bar: React.PropTypes.string.isRequired },
  render() {
    const { children, ...props } = this.props
    const barFromContext = this.context.bar
    return cloneElement(children, { props, barFromContext })
  }
})

const useBar = () => ({
  renderRootContainer: (child) => (
    <BarRootContainer>{child}</BarRootContainer>
  ),
  renderContainer: (child) => (
    <BarContainer>{child}</BarContainer>
  )
})

const BazContainer = React.createClass({
  render() {
    const { children, ...props } = this.props
    return cloneElement(children, props)
  }
})

const useBaz = (bazInjected) => ({
  renderContainer: (child) => (
    <BazContainer bazInjected={bazInjected}>
      {child}
    </BazContainer>
  )
})

const run = ({ renderWithMiddleware, Component }, assertion) => {
  const div = document.createElement('div')
  const routes = <Route path="/" component={Component}/>
  render(<Router
    render={renderWithMiddleware}
    routes={routes}
    history={createMemoryHistory('/')}
  />, div, () => assertion(div.innerHTML))
}

describe('applyMiddleware', () => {

  it('applies one middleware', (done) => {
    run({
      renderWithMiddleware: applyMiddleware(useFoo()),
      Component: (props) => <div>{props.fooFromContext}</div>
    }, (html) => {
      expect(html).toContain(FOO_ROOT_CONTAINER_TEXT)
      done()
    })
  })

  it('applies more than one middleware', (done) => {
    run({
      renderWithMiddleware: applyMiddleware(useBar(), useFoo()),
      Component: (props) => <div>{props.fooFromContext} {props.barFromContext}</div>
    }, (html) => {
      expect(html).toContain(FOO_ROOT_CONTAINER_TEXT)
      expect(html).toContain(BAR_ROOT_CONTAINER_TEXT)
      done()
    })
  })

  it('applies more middleware with only `getContainer`', (done) => {
    run({
      renderWithMiddleware: applyMiddleware(
        useBar(),
        useFoo(),
        useBaz(BAZ_CONTAINER_TEXT)
      ),
      Component: (props) => (
        <div>
          {props.fooFromContext}
          {props.barFromContext}
          {props.bazInjected}
        </div>
      )
    }, (html) => {
      expect(html).toContain(FOO_ROOT_CONTAINER_TEXT)
      expect(html).toContain(BAR_ROOT_CONTAINER_TEXT)
      expect(html).toContain(BAZ_CONTAINER_TEXT)
      done()
    })
  })

  it('applies middleware that only has `getContainer`', (done) => {
    run({
      renderWithMiddleware: applyMiddleware(
        useBaz(BAZ_CONTAINER_TEXT)
      ),
      Component: (props) => (
        <div>{props.bazInjected}</div>
      )
    }, (html) => {
      expect(html).toContain(BAZ_CONTAINER_TEXT)
      done()
    })
  })

})
