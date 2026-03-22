package io.pet.petyard.feed.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FeedHomeRequestTraceTest {

    @Test
    void keepsAllMeasuredDurationsNonNegative() {
        FeedHomeRequestTrace trace = FeedHomeRequestTrace.start()
            .markPostsLoaded()
            .markRelatedDataLoaded()
            .markAssemblyFinished();

        assertThat(trace.postQueryMillis()).isGreaterThanOrEqualTo(0);
        assertThat(trace.relatedQueryMillis()).isGreaterThanOrEqualTo(0);
        assertThat(trace.assemblyMillis()).isGreaterThanOrEqualTo(0);
        assertThat(trace.totalMillis()).isGreaterThanOrEqualTo(0);
    }
}
