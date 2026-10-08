const NodeCache = require("node-cache");

const cache = new NodeCache({
    stdTTL: 60
});

let cacheHits = 0;
let cacheMisses = 0;

cache.recordHit = () => {
    cacheHits++;
};

cache.recordMiss = () => {
    cacheMisses++;
};

cache.getStats = () => {
    return {
        hits: cacheHits,
        misses: cacheMisses
    };
};

module.exports = cache;