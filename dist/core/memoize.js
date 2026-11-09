const serializeArgs = (...args) => JSON.stringify(args);
export const memoize = (fn, resolveKey = serializeArgs) => {
    const cache = new Map();
    return (...args) => {
        const key = resolveKey(...args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};
//# sourceMappingURL=memoize.js.map