import { Tooltip, Typography } from 'antd'
import React, { AnchorHTMLAttributes, FC } from 'react'
import { Link as RLink, LinkProps } from 'react-router-dom'

/**
 * 统一所有的 link 组件
 */
export const CommonLink: FC<Partial<LinkProps & AnchorHTMLAttributes<void>>> = (
  props,
) => {
  const { to, href = to as string, children, ...otherProps } = props

  if (href?.startsWith('/')) {
    // 内部链接，在当前页面打开
    return (
      <RLink to={href} target="_self" {...otherProps}>
        {children}
      </RLink>
    )
  } else if (href?.startsWith('http')) {
    // 外部链接，在新页面打开
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...otherProps}>
        {children}
      </a>
    )
  } else {
    // 否则给出一个错误的提示
    return (
      <Tooltip title={`href = ${href}`}>
        <Typography.Text type="danger" delete>
          Wrong Link
        </Typography.Text>
      </Tooltip>
    )
  }
}
