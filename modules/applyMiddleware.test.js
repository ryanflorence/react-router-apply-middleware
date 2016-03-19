/*eslint-env mocha*/
/*eslint no-console: 0*/
import expect from 'expect'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, createMemoryHistory } from 'react-router'
import applyMiddleware from './applyMiddleware'

const FOO_ROOT_CONTAINER_TEXT = 'FOO ROOT CONTAINER'
const BAR_ROOT_CONTAINER_TEXT = 'BAR ROOT CONTAINER'
const BAZ_CONTAINER_TEXT = 'BAZ INJECTED'

const FooRootContainer = React.createClass({
  propTypes: {
    // 1. applyMiddleware is going to pass a render prop
    render: React.PropTypes.func
  },
  childContextTypes: { foo: React.PropTypes.string },
  getChildContext() { return { foo: FOO_ROOT_CONTAINER_TEXT } },
  render() {
    // 2. all RootContainers need to render with the `render` prop and send
    //    along the bag of props it got (they came from Router)
    const { render, ...props } = this.props
    return render(props)
  }
})

const FooContainer = React.createClass({
  propTypes: {
    // 1. applyMiddleware is going to pass a createElement prop
    createElement: React.PropTypes.func
  },
  contextTypes: { foo: React.PropTypes.string.isRequired },
  render() {
    const { createElement, Component, routerProps } = this.props
    const fooFromContext = this.context.foo
    const mergedProps = { ...routerProps, fooFromContext }
    // 2. So all Containers need to render with the `createElement` prop, passing
    //    along the Component to be rendered and the props to render with
    return createElement(Component, mergedProps)
  }
})

const useFoo = () => ({
  renderRootContainer: (renderProps) => (
    // same signature as Router.props.render
    <FooRootContainer {...renderProps}/>
  ),
  renderContainer: (Component, props) => (
    // same signature as Router.props.createElement
    <FooContainer Component={Component} routerProps={props}/>
  )
})

const BarRootContainer = React.createClass({
  childContextTypes: { bar: React.PropTypes.string },
  getChildContext() { return { bar: BAR_ROOT_CONTAINER_TEXT } },
  render() {
    const { render, ...props } = this.props
    return render(props)
  }
})

const BarContainer = React.createClass({
  contextTypes: { bar: React.PropTypes.string.isRequired },
  render() {
    const { createElement, Component, routerProps } = this.props
    const barFromContext = this.context.bar
    const mergedProps = { ...routerProps, barFromContext }
    return createElement(Component, mergedProps)
  }
})

const useBar = () => ({
  renderRootContainer: (renderProps) => (
    <BarRootContainer {...renderProps}/>
  ),
  renderContainer: (Component, props) => (
    <BarContainer Component={Component} routerProps={props}/>
  )
})

const BazContainer = React.createClass({
  render() {
    const { createElement, Component, routerProps, bazInjected } = this.props
    const mergedProps = { ...routerProps, bazInjected }
    return createElement(Component, mergedProps)
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
