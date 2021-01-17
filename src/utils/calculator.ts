export const putData = (
  ys: number[],
  height: number,
  maxHeight: number
): (number | undefined)[][] => {
  const { data } = ys.reduce(
    ({ data, pys }, y, v) => {
      // 被らない様に x を取得する
      const x =
        [...Array<number>(data.length).keys()].find(
          (i) =>
            data[i]?.slice(y, y + height).every((cv) => cv === undefined) ??
            true
        ) ?? data.length

      // y を隣の値に応じて伸ばす
      let py = y
      if (x > 0) {
        const v = data[x - 1][y]
        py = v !== undefined ? pys[v] : y
      }
      const newPYs = [...pys, py]

      let newData
      if (x < data.length) {
        newData = data.map((lane, i) => {
          if (i !== x) {
            return lane
          }
          return lane.map((cv, j) => {
            if (j >= py && j < y) {
              return -1
            } else if (j >= y && j <= y + height - 1) {
              return v
            } else {
              return cv
            }
          })
        })
      } else {
        newData = [
          ...data,
          Array<number | undefined>(maxHeight)
            .fill(undefined)
            .map((cv, j) => {
              if (j >= py && j < y) {
                return -1
              } else if (j >= y && j <= y + height - 1) {
                return v
              } else {
                return cv
              }
            }),
        ]
      }

      return {
        data: newData,
        pys: newPYs,
      }
    },
    { data: [], pys: [] } as { data: (number | undefined)[][]; pys: number[] }
  )
  return data
}

export const calc = (
  ys: number[],
  height: number,
  maxHeight: number
): { x: number; w: number }[] => {
  if (!ys.length) {
    return []
  }
  const data = putData(ys, height, maxHeight)
  return [...Array<number>(maxHeight).keys()].reduce((carry, j) => {
    return data.reduce((carry, _, i) => {
      const index = carry.length
      const v = data[i][j]
      if (index !== v) {
        return carry
      }
      const columns = data.filter((_, i) => data[i][j] !== undefined).length
      const x = i / columns
      const w = 1 / columns
      return [...carry, { x, w }]
    }, carry)
  }, [] as { x: number; w: number }[])
}
