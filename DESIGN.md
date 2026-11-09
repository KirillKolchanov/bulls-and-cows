# DESIGN

## Структура проекта

```
src/
  core/      чистая игровая логика, без DOM
  app/       чистые переходы состояния приложения (экраны, фильтр ввода)
  storage/   работа с localStorage
  ui/        DOM: хелпер el(), view-функции, контроллер
tests/       тесты на core и app (Vitest)
```

Изменяемое состояние есть только в одном месте — в замыкании `mountApp` (`src/ui/app.ts`). Всё остальное получает данные на вход и возвращает новые данные.

## 1. Структуры данных и алгоритмы

### Секрет и попытка — строки

Секрет и попытка хранятся как строки (`'0123'`, `'a3f0'`). Так сохраняются ведущие нули и не нужно отдельно обрабатывать hex. Перед сравнением все цифры приводятся к нижнему регистру через `normalizeDigit` (`src/core/digits.ts`), поэтому `A` и `a` — одна и та же цифра.

### Состояние игры — неизменяемый объект

`GameState` (`src/core/types.ts`):

```ts
interface GameState {
  readonly settings: GameSettings; // { length, base }
  readonly secret: string;
  readonly history: readonly GuessEntry[]; // { guess, bulls, cows }
  readonly status: 'playing' | 'won';
  readonly startedAt: number;
  readonly finishedAt: number | null;
}
```

- Все поля `readonly`, массив — `readonly GuessEntry[]`, поэтому TypeScript не даст вызвать `push` или переприсвоить поле.
- `applyGuess` (`src/core/game.ts`) возвращает новый объект: `{ ...state, history: [...state.history, entry], ... }`. Старые записи истории не копируются глубоко, а переиспользуются — новый массив ссылается на те же объекты.
- Если попытка не принята (неверная, повтор, игра окончена), `applyGuess` возвращает **тот же** объект — история гарантированно не задваивается, и в тестах это проверяется простым `expect(next).toBe(state)`.
- История — массив, потому что важен порядок попыток, а записи только добавляются в конец. Попыток в одной игре немного, так что копирование массива на каждом ходу не проблема.
- Время хранится как два числа (`startedAt`, `finishedAt`), а прошедшее время вычисляется функцией `getElapsedMs(state, now)`. Таймер на экране ничего не меняет в состоянии, он только читает его.

В тестах состояние замораживается рекурсивно (`deepFreeze` в `tests/core/game.test.ts`), поэтому любая мутация сразу уронила бы тест.

### Состояние приложения

`AppState` (`src/app/state.ts`) хранит настройки, текущий экран, таблицу рекордов и последний рекорд. Экран — размеченное объединение:

```ts
type Screen =
  { kind: 'settings' } | { kind: 'game'; game: GameState; error: GuessError | null; draft: string };
```

Благодаря этому на экране настроек просто нет объекта игры, а настройки во время игры поменять нельзя: `updateSettings` возвращает состояние без изменений, если `screen.kind !== 'settings'`.

### Set для проверок

- `createDigitValidator(base)` один раз строит `Set` допустимых цифр, дальше каждая проверка символа — O(1).
- `isValidGuess` проверяет уникальность цифр сравнением `new Set(digits).size === digits.length`.
- `evaluateGuess` строит `Set` из цифр секрета, чтобы проверка «цифра есть в секрете» была O(1).

### Рекорды

`RecordsTable` (`src/core/types.ts`) — объект, где ключ — настройки раунда (`'10:4'` = dec, 4 цифры), а значение — отсортированный массив из не более чем 10 записей `{ attempts, timeMs, achievedAt }`. Так для каждой комбинации длины и системы счисления ведётся своя таблица, и рекорды bin/2 не смешиваются с hex/6. В `localStorage` таблица хранится как JSON; при чтении `parseRecordsTable` отбрасывает битые данные.

### Алгоритм `evaluateGuess` (`src/core/evaluation.ts`)

1. Секрет и попытка разбиваются на массивы цифр в нижнем регистре.
2. Из цифр секрета строится `Set`.
3. Один проход `reduce` по цифрам попытки с индексом:
   - если `secret[index] === digit` — это bull;
   - иначе, если цифра есть в `Set` секрета — это cow;
   - иначе результат не меняется.
4. Аккумулятор — объект `{ bulls, cows }`; на каждом шаге создаётся новый объект, счётчики не мутируются.

Алгоритм корректен, потому что цифры в секрете уникальны: каждая цифра попытки совпадает максимум с одной позицией секрета, и её можно посчитать либо как bull, либо как cow, но не дважды. Попытки с повторяющимися цифрами отсекаются раньше, в `isValidGuess`.

### Алгоритм `countPossibleSecrets` (`src/core/combinatorics.ts`)

Количество секретов — число размещений без повторений: P(base, length) = base! / (base − length)!. Ведущий ноль разрешён, поэтому ничего не вычитается.

Рекурсия:

```
count(0, base)      = 1                          // пустой секрет — один вариант
count(length, 0)    = 0                          // цифры закончились
count(length, base) = base * count(length - 1, base - 1)
```

На первую позицию можно поставить любую из `base` цифр, на оставшиеся `length - 1` позиций — любую из оставшихся `base - 1`.

Рекурсивная функция `countPermutations` сразу обёрнута в `memoize` (`src/core/memoize.ts`), и рекурсивный вызов идёт через уже мемоизированную версию, поэтому в кэш попадают и промежуточные значения. Например, после `count(4, 10)` уже посчитаны `count(3, 9)`, `count(2, 8)` и т. д. Внешняя функция `countPossibleSecrets` только проверяет аргументы и вызывает мемоизированную.

`memoize` — функция высшего порядка: принимает функцию и возвращает новую с кэшем `Map` внутри замыкания. Ключ по умолчанию — `JSON.stringify(args)`, чтобы `(1, 23)` и `(12, 3)` не совпали. Кэш меняется, но он скрыт в замыкании, а для вызывающего кода функция остаётся чистой: одинаковые аргументы — одинаковый результат.

### Алгоритм `generateSecret` (`src/core/secret.ts`)

Рекурсивная выборка без возвращения:

1. Пул — все цифры системы счисления (`getDigits(base)`).
2. `drawDigits(pool, count, random)` берёт индекс `Math.floor(random() * pool.length)`, кладёт эту цифру в результат и вызывает себя для пула без этой цифры (`removeAt` через `slice`) и `count - 1`.
3. Когда `count === 0`, возвращается пустой массив.

Источник случайности передаётся параметром `random` (по умолчанию `Math.random`). В тестах передаётся функция с заранее заданной последовательностью чисел, и результат детерминирован: например, `random = () => 0` всегда даёт `'0123'`.

## 2. Сложность

Обозначения: `L` — длина секрета (2–6), `B` — основание системы счисления (2, 8, 10, 16), `L ≤ B`.

| Функция                | Время                                      | Память   |
| ---------------------- | ------------------------------------------ | -------- |
| `generateSecret`       | O(L · B)                                   | O(L · B) |
| `evaluateGuess`        | O(L)                                       | O(L)     |
| `isValidGuess`         | O(L + B)                                   | O(L + B) |
| `countPossibleSecrets` | O(L) при первом вызове, O(1) при повторном | O(L)     |

**`generateSecret` — O(L · B).** Рекурсия делает `L` шагов. На каждом шаге `removeAt` создаёт новый пул через `slice`, это O(B). Сборка результата `[digit, ...rest]` добавляет O(L) на шаг, то есть O(L²) всего, но так как `L ≤ B`, это не больше O(L · B). Глубина рекурсии — `L`, не больше 6.

**`evaluateGuess` — O(L).** Нормализация двух строк — O(L), построение `Set` из секрета — O(L), `reduce` по попытке — `L` шагов, на каждом `Set.has` за O(1) и создание объекта из двух полей за O(1).

**`isValidGuess` — O(L + B).** `createDigitValidator(base)` строит `Set` из `B` цифр — O(B). Дальше нормализация O(L), `every` с проверкой каждого символа за O(1) — O(L), проверка уникальности через `Set` — O(L). Так как `B ≤ 16`, на практике это O(L).

**`countPossibleSecrets` — O(L) / O(1).** Без мемоизации рекурсия делает `L + 1` вызовов (длина уменьшается на 1, пока не станет 0), каждый — одно умножение, то есть O(L). Ключ кэша — `JSON.stringify` от двух чисел, это O(1). При повторном вызове с теми же аргументами ответ берётся из `Map` за O(1). Память — O(L) на стек рекурсии и записи в кэше.

## 3. Принципы чистого кода

**Разделение ответственности (SRP).** Каждый слой делает одно:

- `src/core/*` — только игровые правила, ничего не знает о DOM и `localStorage`;
- `src/app/state.ts` — переходы между экранами (`startGame`, `submitGuess`, `returnToSettings`);
- `src/storage/records-storage.ts` — только чтение и запись `localStorage`;
- `src/ui/views/*` — только построение DOM из состояния;
- `src/ui/app.ts` — связывает всё вместе, держит текущее состояние и таймер.

Внутри модулей то же самое: например, в `src/core/secret.ts` есть отдельные `pickIndex`, `removeAt`, `drawDigits`, а сама `generateSecret` только проверяет аргументы и собирает строку.

**Чистые функции и отсутствие скрытых зависимостей.** Всё, от чего зависит результат, передаётся параметром:

- `random` в `generateSecret`;
- `now` в `applyGuess`, `getElapsedMs`, `startGame`, `submitGuess` вместо вызова `Date.now()` внутри;
- `storage` в `loadRecords` / `saveRecords` (по умолчанию `window.localStorage`).

Поэтому тесты детерминированы и не требуют моков времени.

**DRY.**

- `normalizeDigit` (`src/core/digits.ts`) — единая точка приведения регистра; используется в `createDigitValidator`, `isValidGuess`, `evaluateGuess`, `game.ts`.
- `createDigitValidator` используется в трёх местах: `isValidGuess`, `createInputSanitizer` (`src/app/input.ts`) и обработчик `beforeinput` поля ввода (`src/ui/views/game-view.ts`).
- `getDigits` нужен и для генерации секрета, и для подписи «Digits 0–f» в интерфейсе (`src/ui/views/labels.ts`).
- `el()` (`src/ui/dom.ts`) — единственный способ создать элемент, без повторения `createElement` + `setAttribute` по всему коду.

**Говорящие имена.** Функции названы по тому, что они возвращают или проверяют: `isValidGuess`, `hasBeenGuessed`, `getGuessError`, `getAvailableLengths`, `createRecordFromGame`, `getElapsedMs`. Предикаты начинаются с `is` / `has`, фабрики — с `create`.

**Никаких магических чисел и строк.** `MIN_SECRET_LENGTH`, `MAX_SECRET_LENGTH`, `BASE_OPTIONS`, `DEFAULT_SETTINGS` (`src/core/settings.ts`), `RECORDS_LIMIT` (`src/core/records.ts`), `STORAGE_KEY` (`src/storage/records-storage.ts`), `TIMER_INTERVAL_MS` (`src/ui/app.ts`), `GUESS_INPUT_NAME` и `TIMER_ROLE` (`src/ui/views/game-view.ts`).

**Ранний выход (guard clauses).** `getGuessError` проверяет условия по очереди и сразу возвращает ошибку; `applyGuess` первой строкой возвращает исходное состояние, если попытка не принята; `generateSecret` и `countPossibleSecrets` бросают `RangeError` на некорректных аргументах до начала работы.

**Типы как документация.** `Base = 2 | 8 | 10 | 16` не позволяет передать основание 7; `GuessError = 'invalid' | 'duplicate' | 'finished'` — все варианты ошибок видны в одном месте, а `getErrorMessage` в `game-view.ts` использует `Record<GuessError, string>`, так что TypeScript потребует текст для каждой новой ошибки. Включены `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` и `strictTypeChecked` в ESLint.

**Обработка ошибок на границе.** Внешние данные проверяются там, где они входят в программу: `parseRecordsTable` (`src/core/records.ts`) безопасно разбирает JSON и отбрасывает некорректные записи, `loadRecords` / `saveRecords` перехватывают исключения `localStorage`. Ядро при этом работает только с уже проверенными данными.

## Функциональные приёмы — где искать

| Приём                           | Где                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Чистые функции                  | весь `src/core/` и `src/app/`                                                                          |
| Иммутабельность                 | `applyGuess`, `addRecordToTable`, `insertRecord`, `normalizeSettings`, `submitGuess`                   |
| Функции высшего порядка         | `memoize`; `map` / `filter` / `reduce` / `every` / `some` в `evaluateGuess`, `isValidGuess`, `records` |
| Каррирование                    | `createDigitValidator(base)(char)`, `insertRecord(limit)(records, entry)`, `createInputSanitizer`      |
| Мемоизация                      | `memoize` + `countPossibleSecrets`                                                                     |
| Рекурсия                        | `countPermutations` в `countPossibleSecrets`, `drawDigits` в `generateSecret`                          |
| Внедрение источника случайности | `generateSecret(length, base, random)`                                                                 |
