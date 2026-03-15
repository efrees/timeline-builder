---
title: Constraint Propagation Demo
description: Shows how relative constraints narrow date ranges
---

grandfather: Grandfather born
  date: 1920-1925

father: Father born
  after: grandfather + 25 years
  date: 1945-1965

myself: My birth
  after: father + 20 years
  date: 1970-2000

sister: Sister born
  after: myself + 2 years
  date: 1980-2010
