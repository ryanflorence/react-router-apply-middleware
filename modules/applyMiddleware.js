import React, { createElement } from 'react'
import RouterContext from 'react-router/lib/RouterContext'

export default (...middleware) => (
  ((makeCreateElement) => ((renderProps) => (
    middleware.filter(m => m.renderRootContainer).reduceRight(
      (previous, { renderRootContainer }) => (
        renderRootContainer(previous, renderProps)
      ), (
        <RouterContext
          {...renderProps}
          createElement={makeCreateElement(renderProps.createElement)}
        />
      )
    )
  )))((baseCreateElement = createElement) => ((Component, props) => (
    middleware.filter(m => m.renderContainer).reduceRight(
      (previous, { renderContainer }) => (
        renderContainer(previous, props)
      ), baseCreateElement(Component, props)
  ))))
)

