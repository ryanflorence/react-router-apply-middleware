/*eslint-env mocha*/
/*eslint no-console: 0*/
import expect from 'expect'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, RouterContext, createMemoryHistory } from 'react-router'
import applyMiddleware from './applyMiddleware'

const FOO_ROOT_CONTAINER_TEXT = 'FOO ROOT CONTAINER'
const BAR_ROOT_CONTAINER_TEXT = 'BAR ROOT CONTAINER'
const BAZ_CONTAINER_TEXT = 'BAZ INJECTED'

const FooRootContainer = React.createClass({
  childContextTypes: { foo: React.PropTypes.string },
  getChildContext() { return { foo: FOO_ROOT_CONTAINER_TEXT } },
  // all RootContainers need to render with the `render` prop
  render() {
    const { render, ...props } = this.props
    return render(props)
  },
  // and so all RootContainers need to implement this as a default prop
  getDefaultProps() {
    return { render: (renderProps) => <RouterContext {...renderProps}/> }
  }
})

const FooContainer = React.createClass({
  contextTypes: { foo: React.PropTypes.string.isRequired },
  render() {
    const { createElement, Component, routerProps } = this.props
    const fooFromContext = this.context.foo
    const mergedProps = { ...routerProps, fooFromContext }
    // all Containers need to render with the `createElement` prop
    return createElement(Component, mergedProps)
  },
  // and so all Containers need to implement a default prop
  getDefaultProps() {
    return { createElement: (Component, props) => <Component {...props} /> }
  }
})

const useFoo = () => ({
  renderRootContainer: (renderProps) => {
    // renderProps comes in from ReactRouter before rendering a RouterContext
    return <FooRootContainer {...renderProps}/>
  },
  renderContainer: (Component, props) => {
    // Component, props come from React Router `createElement` prop just before
    // it creates elements to render
    return <FooContainer Component={Component} routerProps={props}/>
  }
})

const BarRootContainer = React.createClass({
  childContextTypes: { bar: React.PropTypes.string },
  getChildContext() { return { bar: BAR_ROOT_CONTAINER_TEXT } },
  render() {
    const { render, ...props } = this.props
    return render(props)
  },
  getDefaultProps() {
    return { render: (renderProps) => <RouterContext {...renderProps}/> }
  }
})

const BarContainer = React.createClass({
  contextTypes: { bar: React.PropTypes.string.isRequired },
  render() {
    const { createElement, Component, routerProps } = this.props
    const barFromContext = this.context.bar
    const mergedProps = { ...routerProps, barFromContext }
    return createElement(Component, mergedProps)
  },
  getDefaultProps() {
    return { createElement: (Component, props) => <Component {...props} /> }
  }
})

const useBar = () => ({
  renderRootContainer: (renderProps) => {
    // renderProps comes in from ReactRouter before rendering a RouterContext
    return <BarRootContainer {...renderProps}/>
  },
  renderContainer: (Component, props) => {
    // Component, props come from React Router `createElement` prop just before
    // it creates elements to render
    return <BarContainer Component={Component} routerProps={props}/>
  }
})

const BazContainer = React.createClass({
  render() {
    const { createElement, Component, routerProps, bazInjected } = this.props
    const mergedProps = { ...routerProps, bazInjected }
    return createElement(Component, mergedProps)
  },
  getDefaultProps() {
    return { createElement: (Component, props) => <Component {...props} /> }
  }
})

const useBaz = (bazInjected) => ({
  renderContainer: (Component, props) => (
    <BazContainer
      Component={Component}
      routerProps={props}
      bazInjected={bazInjected}
    />
  )
})

describe('applyMiddleware', () => {

  const run = ({ renderWithMiddleware, Component }, assertion) => {
    const div = document.createElement('div')
    const routes = <Route path="/" component={Component}/>
    render(<Router
      render={renderWithMiddleware}
      routes={routes}
      history={createMemoryHistory('/')}
    />, div, () => assertion(div.innerHTML))
  }

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
})
