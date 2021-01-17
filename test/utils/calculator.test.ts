import { calc, putData } from '../../src/utils/calculator'

describe('putData', () => {
  const o = undefined
  const x = -1

  it('should work with height 1', () => {
    let result: ReturnType<typeof putData>

    result = putData([0], 1, 1)
    expect(result).toEqual([[0]])

    result = putData([0, 0], 1, 1)
    expect(result).toEqual([[0], [1]])

    result = putData([0, 0, 0], 1, 1)
    expect(result).toEqual([[0], [1], [2]])

    result = putData([0, 0, 0], 1, 2)
    expect(result).toEqual([
      [0, o],
      [1, o],
      [2, o],
    ])

    result = putData([0, 0, 1], 1, 2)
    expect(result).toEqual([
      [0, 2],
      [1, o],
    ])

    result = putData([0, 1, 2], 1, 3)
    expect(result).toEqual([[0, 1, 2]])
  })
  it('should work with height 2', () => {
    let result: ReturnType<typeof putData>

    result = putData([0, 0], 2, 2)
    expect(result).toEqual([
      [0, 0],
      [1, 1],
    ])

    result = putData([0, 2], 2, 4)
    expect(result).toEqual([[0, 0, 1, 1]])

    result = putData([0, 0], 2, 3)
    expect(result).toEqual([
      [0, 0, o],
      [1, 1, o],
    ])

    result = putData([0, 1], 2, 3)
    expect(result).toEqual([
      [0, 0, o],
      [x, 1, 1],
    ])

    result = putData([0, 0, 0], 2, 2)
    expect(result).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ])

    result = putData([0, 2, 4], 2, 6)
    expect(result).toEqual([[0, 0, 1, 1, 2, 2]])

    result = putData([0, 0, 0], 2, 3)
    expect(result).toEqual([
      [0, 0, o],
      [1, 1, o],
      [2, 2, o],
    ])

    result = putData([0, 0, 2], 2, 4)
    expect(result).toEqual([
      [0, 0, 2, 2],
      [1, 1, o, o],
    ])

    result = putData([0, 1, 2], 2, 4)
    expect(result).toEqual([
      [0, 0, 2, 2],
      [x, 1, 1, o],
    ])

    result = putData([0, 0, 1], 2, 4)
    expect(result).toEqual([
      [0, 0, o, o],
      [1, 1, o, o],
      [x, 2, 2, o],
    ])

    result = putData([0, 0, 1, 2], 2, 4)
    expect(result).toEqual([
      [0, 0, 3, 3],
      [1, 1, o, o],
      [x, 2, 2, o],
    ])

    result = putData([0, 1, 2, 2], 2, 4)
    expect(result).toEqual([
      [0, 0, 2, 2],
      [x, 1, 1, o],
      [x, x, 3, 3],
    ])
  })
})

describe('calc', () => {
  it('should work with height 1', () => {
    let result: ReturnType<typeof calc>

    // result = putData([0], 1, 1)
    // expect(result).toEqual([[0]])
    result = calc([0], 1, 1)
    expect(result).toEqual([{ x: 0, w: 1 }])

    // result = putData([0, 0], 1, 1)
    // expect(result).toEqual([[0], [1]])
    result = calc([0, 0], 1, 1)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
    ])

    // result = putData([0, 0, 0], 1, 1)
    // expect(result).toEqual([[0], [1], [2]])
    result = calc([0, 0, 0], 1, 1)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])

    // result = putData([0, 0, 0], 1, 2)
    // expect(result).toEqual([
    //   [0, o],
    //   [1, o],
    //   [2, o],
    // ])
    result = calc([0, 0, 0], 1, 2)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])

    // result = putData([0, 0, 1], 1, 2)
    // expect(result).toEqual([
    //   [0, 2],
    //   [1, o],
    // ])
    result = calc([0, 0, 1], 1, 2)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
      { x: 0, w: 1 },
    ])

    // result = putData([0, 1, 2], 1, 3)
    // expect(result).toEqual([[0, 1, 2]])
    result = calc([0, 1, 2], 1, 3)
    expect(result).toEqual([
      { x: 0, w: 1 },
      { x: 0, w: 1 },
      { x: 0, w: 1 },
    ])
  })
  it('should work with height 2', () => {
    let result: ReturnType<typeof calc>

    // result = putData([0, 0], 2, 2)
    // expect(result).toEqual([
    //   [0, 0],
    //   [1, 1],
    // ])
    result = calc([0, 0], 2, 2)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
    ])

    // result = putData([0, 2], 2, 4)
    // expect(result).toEqual([[0, 0, 1, 1]])
    result = calc([0, 2], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 },
      { x: 0, w: 1 },
    ])

    // result = putData([0, 0], 2, 3)
    // expect(result).toEqual([
    //   [0, 0, o],
    //   [1, 1, o],
    // ])
    result = calc([0, 0], 2, 3)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
    ])

    // result = putData([0, 1], 2, 3)
    // expect(result).toEqual([
    //   [0, 0, o],
    //   [x, 1, 1],
    // ])
    result = calc([0, 1], 2, 3)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
    ])

    // result = putData([0, 0, 0], 2, 2)
    // expect(result).toEqual([
    //   [0, 0],
    //   [1, 1],
    //   [2, 2],
    // ])
    result = calc([0, 0, 0], 2, 2)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])

    // result = putData([0, 2, 4], 2, 6)
    // expect(result).toEqual([[0, 0, 1, 1, 2, 2]])
    result = calc([0, 2, 4], 2, 6)
    expect(result).toEqual([
      { x: 0, w: 1 },
      { x: 0, w: 1 },
      { x: 0, w: 1 },
    ])

    // result = putData([0, 0, 0], 2, 3)
    // expect(result).toEqual([
    //   [0, 0, o],
    //   [1, 1, o],
    //   [2, 2, o],
    // ])
    result = calc([0, 0, 0], 2, 3)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])

    // result = putData([0, 0, 2], 2, 4)
    // expect(result).toEqual([
    //   [0, 0, 2, 2],
    //   [1, 1, o, o],
    // ])
    result = calc([0, 0, 2], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
      { x: 0, w: 1 },
    ])

    // result = putData([0, 1, 2], 2, 4)
    // expect(result).toEqual([
    //   [0, 0, 2, 2],
    //   [x, 1, 1, o],
    // ])
    result = calc([0, 1, 2], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 / 2 },
      { x: 1 / 2, w: 1 / 2 },
      { x: 0, w: 1 / 2 },
    ])

    // result = putData([0, 0, 1], 2, 4)
    // expect(result).toEqual([
    //   [0, 0, o, o],
    //   [1, 1, o, o],
    //   [x, 2, 2, o],
    // ])
    result = calc([0, 0, 1], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])

    // result = putData([0, 0, 1, 2], 2, 4)
    // expect(result).toEqual([
    //   [0, 0, 3, 3],
    //   [1, 1, o, o],
    //   [x, 2, 2, o],
    // ])
    result = calc([0, 0, 1, 2], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
      { x: 0, w: 1 / 2 },
    ])

    // result = putData([0, 1, 2, 2], 2, 4)
    // expect(result).toEqual([
    //   [0, 0, 2, 2],
    //   [x, 1, 1, o],
    //   [x, x, 3, 3],
    // ])
    result = calc([0, 1, 2, 2], 2, 4)
    expect(result).toEqual([
      { x: 0, w: 1 / 3 },
      { x: 1 / 3, w: 1 / 3 },
      { x: 0, w: 1 / 3 },
      { x: 2 / 3, w: 1 / 3 },
    ])
  })
})
