import React from 'react'

export const useSrcSet = (): ((
  src?: string
) => {
  src?: string
  srcSet?: string
}) => {
  return React.useCallback((src?: string) => {
    if (!src) {
      return { src, srcSet: undefined }
    }
    const index = src.lastIndexOf('.')
    const basename = src.slice(0, index)
    const extension = src.slice(index)
    return {
      src,
      srcSet: `${basename}${extension} 1x, ${basename}@2x${extension} 2x`,
    }
  }, [])
}
