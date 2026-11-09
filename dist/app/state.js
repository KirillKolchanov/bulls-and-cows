import { applyGuess, createGame, getGuessError } from '../core/game.js';
import { addRecordToTable, createRecordFromGame } from '../core/records.js';
import { DEFAULT_SETTINGS, normalizeSettings } from '../core/settings.js';
const SETTINGS_SCREEN = { kind: 'settings' };
export const createAppState = (records) => ({
    settings: DEFAULT_SETTINGS,
    screen: SETTINGS_SCREEN,
    records,
    latestRecord: null,
});
export const updateSettings = (state, settings) => state.screen.kind === 'settings' ? { ...state, settings: normalizeSettings(settings) } : state;
export const startGame = (state, secret, now) => ({
    ...state,
    screen: { kind: 'game', game: createGame(state.settings, secret, now), error: null, draft: '' },
    latestRecord: null,
});
export const submitGuess = (state, guess, now) => {
    if (state.screen.kind !== 'game') {
        return state;
    }
    const { game } = state.screen;
    const error = getGuessError(game, guess);
    if (error !== null) {
        return { ...state, screen: { ...state.screen, error, draft: guess } };
    }
    const nextGame = applyGuess(game, guess, now);
    const record = createRecordFromGame(nextGame);
    return {
        ...state,
        screen: { kind: 'game', game: nextGame, error: null, draft: '' },
        records: record === null ? state.records : addRecordToTable(state.records, nextGame.settings, record),
        latestRecord: record ?? state.latestRecord,
    };
};
export const returnToSettings = (state) => ({
    ...state,
    screen: SETTINGS_SCREEN,
});
//# sourceMappingURL=state.js.map