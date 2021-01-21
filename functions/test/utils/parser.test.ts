import { advanceTo, clear } from 'jest-date-mock'
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
    expect(result?.activities.length).toBe(3)
    expect(result?.activities[0]).toEqual({
      groupId: 'honeystrap',
      memberId: 'mary-saionji',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T12:00:00.000Z'),
      source: 'twitter',
    })
    expect(result?.activities[1]).toEqual({
      groupId: 'honeystrap',
      memberId: 'charlotte-shimamura',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T13:00:00.000Z'),
      source: 'twitter',
    })
    expect(result?.activities[2]).toEqual({
      groupId: 'honeystrap',
      memberId: 'patra-suou',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T15:00:00.000Z'),
      source: 'twitter',
    })
  })
  it('should work with over 24:00', () => {
    const result = parseMessage('1/11(水)\n25:00 ミコ\n\n', 'honeystrap')
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(1)
    expect(result?.activities[0]).toEqual({
      groupId: 'honeystrap',
      memberId: 'mico-sekishiro',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T16:00:00.000Z'),
      source: 'twitter',
    })
  })
  it('should work with title', () => {
    const result = parseMessage(
      '1/11(水)\n18:00 ミコ(メンバー限定配信)\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(1)
    expect(result?.activities[0]).toEqual({
      groupId: 'honeystrap',
      memberId: 'mico-sekishiro',
      title: '',
      description: 'メンバー限定配信',
      startedAt: new Date('2021-01-11T09:00:00.000Z'),
      source: 'twitter',
    })
  })
  it('should work with title', () => {
    const result = parseMessage(
      '1/11(水)\n19:00 ミコ(メンバー限定配信)\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(1)
    expect(result?.activities[0]).toEqual({
      groupId: 'honeystrap',
      memberId: 'mico-sekishiro',
      title: '',
      description: 'メンバー限定配信',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
  })
  it('should work with title and description', () => {
    let result = parseMessage(
      '1/11(水)\n19:00 メアリ(羽柴なつみさん企画参加)＊羽柴なつみさんch\n\n',
      'honeystrap'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(1)
    expect(result?.activities[0]).toEqual({
      groupId: 'honeystrap',
      memberId: 'mary-saionji',
      title: '',
      description: '羽柴なつみさん企画参加(羽柴なつみさんch)',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })

    result = parseMessage(
      '1/11(水)\n19:00 はねる(コラボ)\n＊ルイス・キャミーさんch\n\n',
      'animare'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(1)
    expect(result?.activities[0]).toEqual({
      groupId: 'animare',
      memberId: 'haneru-inaba',
      title: '',
      description: 'コラボ(ルイス・キャミーさんch)',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
  })
  it('should work with collaboration', () => {
    let result = parseMessage(
      '1/11(水)\n19:00 らん(ひかりコラボ)\n\n',
      'animare'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(2)
    expect(result?.activities[0]).toEqual({
      groupId: 'animare',
      memberId: 'ran-hinokuma',
      title: '',
      description: 'ひかりコラボ',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
    expect(result?.activities[1]).toEqual({
      groupId: 'animare',
      memberId: 'hikari-hira',
      title: '',
      description: 'ひかりコラボ',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })

    result = parseMessage(
      '1/11(水)\n19:00 らん/ひかり/るいコラボ\n\n',
      'animare'
    )
    expect(result?.date).toEqual(new Date('2021-01-10T15:00:00.000Z'))
    expect(result?.activities.length).toBe(3)
    expect(result?.activities[0]).toEqual({
      groupId: 'animare',
      memberId: 'ran-hinokuma',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
    expect(result?.activities[1]).toEqual({
      groupId: 'animare',
      memberId: 'hikari-hira',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
    expect(result?.activities[2]).toEqual({
      groupId: 'animare',
      memberId: 'rui-seshima',
      title: '',
      description: '',
      startedAt: new Date('2021-01-11T10:00:00.000Z'),
      source: 'twitter',
    })
  })
})
