---
title: Timeline with Uncertainty Features
description: Demonstrates various uncertainty representations
---

anchoredEvent: An anchored event
  date: 1900

approximateEvent: Approximately 1920
  date: ~1920
  confidence: [medium]

rangeEvent: Event with date range
  date: 1918-1922
  note: Known to be within this 4-year window

relativeUncertain: Event with uncertain offset
  after: anchoredEvent + 13-15 years
  note: Between 13 and 15 years after anchor

approximateRelative: Approximately 3 years later
  after: relativeUncertain + ~3 years
  confidence: [low]
  note: Rough estimate

durationEvent: Event with duration
  after: approximateRelative + 2 years
  duration: 5 years
  note: Lasted exactly 5 years

uncertainDuration: Event with uncertain duration
  after: durationEvent + 1 year
  duration: 3-7 years
  note: Duration itself is uncertain
