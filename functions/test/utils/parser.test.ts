import { advanceTo, clear } from 'jest-date-mock';
import {
  parseFullMessage,
  extractDate,
  parseMessage,
} from '../../src/utils/parser'

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
    advanceTo(new Date('2021-01-10T15:00:00.000Z'))

    const date = extractDate('2/11(月)\n')
    expect(date).toEqual(new Date('2021-02-10T15:00:00.000Z'))

    clear()
  })
  it('should work with before month', () => {
    advanceTo(new Date('2021-03-10T15:00:00.000Z'))

    const date = extractDate('2/11(月)\n')
    expect(date).toEqual(new Date('2022-02-10T15:00:00.000Z'))

    clear()
  })
  it('should work with empty strng', () => {
    const date = extractDate('')
    expect(date).toEqual(undefined)
  })
})

describe('parseMessage', () => {
  it('should work', () => {
    const result = parseMessage(
      '1/11(月)\nシャル 配信中です\n21:00 メアリ\n22:00 シャル\n24:00 パトラ\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(3)
    expect(result?.events[0]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'mary-saionji',
      title: '',
      startedAt: new Date('2021-01-11T12:00:00.000Z'),
    })
    expect(result?.events[1]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'charlotte-shimamura',
      title: '',
      startedAt: new Date('2021-01-11T13:00:00.000Z'),
    })
    expect(result?.events[2]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'patra-suou',
      title: '',
      startedAt: new Date('2021-01-11T15:00:00.000Z'),
    })
  })
  it('should work with title', () => {
    const result = parseMessage(
      '1/11(水)\n18:00 ミコ(メンバー限定配信)\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(1)
    expect(result?.events[0]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'mico-sekishiro',
      title: 'メンバー限定配信',
      startedAt: new Date('2021-01-11T09:00:00.000Z'),
    })
  })
  it('should work with title', () => {
    const result = parseMessage(
      '1/11(水)\n19:00 ミコ(メンバー限定配信)\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(1)
    expect(result?.events[0]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'mico-sekishiro',
      title: 'メンバー限定配信',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })
  })
  it('should work with title and description', () => {
    let result = parseMessage(
      '1/11(水)\n19:00 メアリ(羽柴なつみさん企画参加)＊羽柴なつみさんch\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(1)
    expect(result?.events[0]).toEqual({
      groupId: 'honeystrap',
      ownerId: 'mary-saionji',
      title: '羽柴なつみさん企画参加(羽柴なつみさんch)',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })

    result = parseMessage(
      '1/11(水)\n19:00 はねる(コラボ)\n＊ルイス・キャミーさんch\n\n',
      'animare'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(1)
    expect(result?.events[0]).toEqual({
      groupId: 'animare',
      ownerId: 'haneru-inaba',
      title: 'コラボ(ルイス・キャミーさんch)',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })
  })
  it('should work with collaboration', () => {
    const result = parseMessage(
      '1/11(水)\n19:00 らん/ひかり/るいコラボ\n\n',
      'animare'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.events.length).toBe(3)
    expect(result?.events[0]).toEqual({
      groupId: 'animare',
      ownerId: 'ran-hinokuma',
      title: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })
    expect(result?.events[1]).toEqual({
      groupId: 'animare',
      ownerId: 'hikari-hira',
      title: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })
    expect(result?.events[2]).toEqual({
      groupId: 'animare',
      ownerId: 'rui-seshima',
      title: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
    })
  })
})
