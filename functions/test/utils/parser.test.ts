import { parseFullMessage, extractDate, parseMessage } from '../../src/utils/parser'

describe('parseFullMessage', () => {
  it('should work', () => {
    const text = `今日・明日のハニストメンバーの配信スケジュールとなります！
1/11(月)
シャル 配信中です
21:00 メアリ
22:00 シャル
24:00 パトラ

1/12(火)
18:00 ミコ
22:00 パトラ
23:00 シャル

#ハニスト`
    const messages = parseFullMessage(text)
    expect(messages.length).toBe(2)
    expect(messages[0]).toBe(
      '1/11(月)\nシャル 配信中です\n21:00 メアリ\n22:00 シャル\n24:00 パトラ\n\n'
    )
    expect(messages[1]).toBe(
      '1/12(火)\n18:00 ミコ\n22:00 パトラ\n23:00 シャル\n\n#ハニスト'
    )
  })
  it('should work with no matches', () => {
    const text = `ハニストが参加させていただいている
サプライズボックスですが、2月号の受付は本日までとなります！

毎月、サプライズでグッズが届くサービスです！
ハニストならではのアイテム、普段使いできるアイテム、たくさんあります♪

ぜひご覧ください！

#ハニスト
#サプライズボックス`
    const messages = parseFullMessage(text)
    expect(messages.length).toBe(0)
  })
})

describe('extractDate', () => {
  it('should work', () => {
    const date = extractDate('1/11(月)\n')
    expect(date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
  })
  it('should work with empty strng', () => {
    const date = extractDate('')
    expect(date).toEqual(undefined)
  })
})

describe('parseMessage', () => {
  it('should work', () => {
    const result = parseMessage('1/11(月)\nシャル 配信中です\n21:00 メアリ\n22:00 シャル\n24:00 パトラ\n\n')
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(3)
    expect(result?.events[0]).toEqual({
      ownerId: 'mary-saionji',
      title: '',
      startedAt: new Date('2021-01-11T12:00:00.000Z')
    })
    expect(result?.events[1]).toEqual({
      ownerId: 'charlotte-shimamura',
      title: '',
      startedAt: new Date('2021-01-11T13:00:00.000Z')
    })
    expect(result?.events[2]).toEqual({
      ownerId: 'patra-suou',
      title: '',
      startedAt: new Date('2021-01-11T15:00:00.000Z')
    })
  })
})
