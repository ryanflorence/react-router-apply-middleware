import { cloneElement } from 'react'
import React from 'react'
import RouterContext from 'react-router/lib/RouterContext'

export default (...middleware) => (
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

