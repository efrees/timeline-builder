---
title: Constraint Propagation Demo
description: Shows how relative constraints narrow date ranges
---

grandfather: Grandfather born
  date: 1920-1925

father: Father born
  after: grandfather + 25 years
  before: grandfather + 40 years

myself: My birth
  after: father + 20 years
  before: father + 35 years

sister: Sister born
  after: myself + 2 years
  before: myself + 5 years
