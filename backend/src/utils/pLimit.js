/**
 * Tiny concurrency limiter so we don't hammer source sites.
 * Usage:
 *   const limit = pLimit(4);
 *   const results = await Promise.all(items.map(it => limit(() => doWork(it))));
 */
function pLimit(concurrency) {
  const queue = [];
  let active = 0;

  const next = () => {
    active--;
    if (queue.length) queue.shift()();
  };

  return (fn) =>
    new Promise((resolve, reject) => {
      const run = () => {
        active++;
        Promise.resolve()
          .then(fn)
          .then((v) => { resolve(v); next(); })
          .catch((e) => { reject(e); next(); });
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
}

module.exports = { pLimit };
