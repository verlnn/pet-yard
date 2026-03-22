package io.pet.petyard.feed.application.service;

record FeedHomeRequestTrace(
    long startedAtNanos,
    long postsLoadedAtNanos,
    long relatedDataLoadedAtNanos,
    long assemblyFinishedAtNanos
) {
    static FeedHomeRequestTrace start() {
        long now = System.nanoTime();
        return new FeedHomeRequestTrace(now, now, now, now);
    }

    FeedHomeRequestTrace markPostsLoaded() {
        return new FeedHomeRequestTrace(startedAtNanos, System.nanoTime(), relatedDataLoadedAtNanos, assemblyFinishedAtNanos);
    }

    FeedHomeRequestTrace markRelatedDataLoaded() {
        return new FeedHomeRequestTrace(startedAtNanos, postsLoadedAtNanos, System.nanoTime(), assemblyFinishedAtNanos);
    }

    FeedHomeRequestTrace markAssemblyFinished() {
        return new FeedHomeRequestTrace(startedAtNanos, postsLoadedAtNanos, relatedDataLoadedAtNanos, System.nanoTime());
    }

    long postQueryMillis() {
        return millisBetween(startedAtNanos, postsLoadedAtNanos);
    }

    long relatedQueryMillis() {
        return millisBetween(postsLoadedAtNanos, relatedDataLoadedAtNanos);
    }

    long assemblyMillis() {
        return millisBetween(relatedDataLoadedAtNanos, assemblyFinishedAtNanos);
    }

    long totalMillis() {
        return millisBetween(startedAtNanos, assemblyFinishedAtNanos);
    }

    private long millisBetween(long from, long to) {
        return Math.max(0L, (to - from) / 1_000_000L);
    }
}
