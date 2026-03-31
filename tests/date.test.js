// tests/date.test.js
const { getDaysLeft, getItemStatus, formatDate, toMidnight } = require('../miniprogram/utils/date')

// 固定「今天」为 2026-04-01，避免测试随日期漂移
const TODAY = '2026-04-01'
beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(TODAY))
})
afterAll(() => {
  jest.useRealTimers()
})

describe('toMidnight', () => {
  test('同一天不同时间归一化后相等', () => {
    expect(toMidnight('2026-04-01T08:00:00')).toBe(toMidnight('2026-04-01T23:59:59'))
  })
})

describe('getDaysLeft', () => {
  test('到期日 = 今天，返回 0', () => {
    expect(getDaysLeft('2026-04-01')).toBe(0)
  })
  test('到期日在明天，返回 1', () => {
    expect(getDaysLeft('2026-04-02')).toBe(1)
  })
  test('到期日在昨天，返回 -1', () => {
    expect(getDaysLeft('2026-03-31')).toBe(-1)
  })
  test('到期日在 7 天后，返回 7', () => {
    expect(getDaysLeft('2026-04-08')).toBe(7)
  })
  test('到期日在 30 天后，返回 30', () => {
    expect(getDaysLeft('2026-05-01')).toBe(30)
  })
})

describe('getItemStatus', () => {
  test('已过期（昨天）-> expired', () => {
    expect(getItemStatus('2026-03-31')).toBe('expired')
  })
  test('今天到期 -> near', () => {
    expect(getItemStatus('2026-04-01')).toBe('near')
  })
  test('7 天后到期 -> near', () => {
    expect(getItemStatus('2026-04-08')).toBe('near')
  })
  test('8 天后到期 -> normal', () => {
    expect(getItemStatus('2026-04-09')).toBe('normal')
  })
  test('30 天后到期 -> normal', () => {
    expect(getItemStatus('2026-05-01')).toBe('normal')
  })
})

describe('formatDate', () => {
  test('格式化为 YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-04-01'))).toBe('2026-04-01')
  })
  test('月份和日期补零', () => {
    expect(formatDate(new Date('2026-01-05'))).toBe('2026-01-05')
  })
})
