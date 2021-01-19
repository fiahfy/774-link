import React from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement>

const Image: React.FC<Props> = (props) => {
  const { src, ...others } = props

  const srcSet = React.useMemo(() => {
    if (!src) {
      return undefined
    }
    const index = src.lastIndexOf('.')
    const basename = src.slice(0, index)
    const extension = src.slice(index)
    return `${basename}${extension} 1x, ${basename}@2x${extension} 2x`
  }, [src])

  return <img {...others} src={src} srcSet={srcSet} />
}

export default Image
