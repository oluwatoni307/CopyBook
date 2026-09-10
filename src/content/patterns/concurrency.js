// Concurrency & async patterns category.
// Same shape as oop.js — see that file's header comment.
//
// This category was added after the initial ship to demonstrate the
// registry's extensibility claim in practice, not just in documentation:
// this file didn't exist before, and the only integration step was adding
// it to patterns/index.js's REGISTRY — nothing in patterns-engine.js or
// main-patterns.js needed to change.

export const patterns = [
  {
    id: "async-producer-consumer-py",
    name: "Producer-consumer with a queue",
    category: "Concurrency & Async",
    language: "python",
    description: "Decouples work generation from work handling using a thread-safe queue, so producers and consumers can run at different paces.",
    code: `import queue
import threading

work_queue = queue.Queue()


def producer():
    for i in range(5):
        work_queue.put(i)


def consumer():
    while True:
        item = work_queue.get()
        print(f"Processing {item}")
        work_queue.task_done()`,
  },
  {
    id: "async-await-py",
    name: "Async/await with asyncio",
    category: "Concurrency & Async",
    language: "python",
    description: "Runs I/O-bound work concurrently on a single thread by yielding control at await points.",
    code: `import asyncio


async def fetch_data(url):
    await asyncio.sleep(1)
    return f"data from {url}"


async def main():
    results = await asyncio.gather(
        fetch_data("a"), fetch_data("b")
    )
    print(results)`,
  },
  {
    id: "async-lock-py",
    name: "Mutex lock for shared state",
    category: "Concurrency & Async",
    language: "python",
    description: "Protects a shared counter from race conditions when multiple threads increment it concurrently.",
    code: `import threading

counter = 0
lock = threading.Lock()


def increment():
    global counter
    with lock:
        counter += 1`,
  },
  {
    id: "async-thread-pool-py",
    name: "Thread pool for parallel tasks",
    category: "Concurrency & Async",
    language: "python",
    description: "Runs a batch of independent tasks concurrently using a bounded pool of worker threads.",
    code: `from concurrent.futures import ThreadPoolExecutor


def fetch(url):
    return f"fetched {url}"


urls = ["a", "b", "c"]
with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(fetch, urls))`,
  },
  {
    id: "async-retry-py",
    name: "Retry with backoff",
    category: "Concurrency & Async",
    language: "python",
    description: "Retries a flaky async operation with an increasing delay between attempts, rather than failing immediately.",
    code: `import asyncio


async def retry(coro_func, attempts=3):
    for i in range(attempts):
        try:
            return await coro_func()
        except Exception:
            if i == attempts - 1:
                raise
            await asyncio.sleep(2 ** i)`,
  },
  {
    id: "async-future-dart",
    name: "Future with async/await",
    category: "Concurrency & Async",
    language: "dart",
    description: "Runs asynchronous work and awaits its result, the primary concurrency primitive in Dart.",
    code: `Future<String> fetchData(String url) async {
  await Future.delayed(Duration(seconds: 1));
  return 'data from \$url';
}

Future<void> main() async {
  final result = await fetchData('a');
  print(result);
}`,
  },
  {
    id: "async-stream-dart",
    name: "Stream of events",
    category: "Concurrency & Async",
    language: "dart",
    description: "Models a sequence of asynchronous values over time, consumed with await-for or listen.",
    code: `Stream<int> countUp(int max) async* {
  for (var i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

void listenToCount() {
  countUp(3).listen((value) => print(value));
}`,
  },
  {
    id: "async-future-wait-dart",
    name: "Parallel futures with Future.wait",
    category: "Concurrency & Async",
    language: "dart",
    description: "Runs several independent async operations concurrently and waits for all of them to complete.",
    code: `Future<void> loadAll() async {
  final results = await Future.wait([
    fetchUser(),
    fetchSettings(),
    fetchNotifications(),
  ]);
  print(results);
}`,
  },
  {
    id: "async-completer-dart",
    name: "Completer for manual Future control",
    category: "Concurrency & Async",
    language: "dart",
    description: "A Completer lets you create a Future and resolve it manually later, useful when wrapping callback-based APIs.",
    code: `Future<String> waitForSignal() {
  final completer = Completer<String>();

  signalSource.onSignal((value) {
    completer.complete(value);
  });

  return completer.future;
}`,
  },
  {
    id: "async-isolate-dart",
    name: "Isolate for CPU-bound work",
    category: "Concurrency & Async",
    language: "dart",
    description: "Runs heavy computation on a separate isolate so it doesn't block the main event loop.",
    code: `Future<int> heavyComputation(int input) {
  return Isolate.run(() {
    var result = 0;
    for (var i = 0; i < input; i++) {
      result += i;
    }
    return result;
  });
}`,
  },
];
