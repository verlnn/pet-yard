package io.pet.petyard.user.application.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GuardianRequestRateLimiterTest {

    @Test
    @DisplayName("1초 안에 3회까지는 허용한다")
    void allowsThreeRequestsWithinWindow() {
        MutableClock clock = new MutableClock(Instant.parse("2026-03-23T12:00:00Z"));
        GuardianRequestRateLimiter limiter = new GuardianRequestRateLimiter(clock);

        assertThatCode(() -> limiter.checkAllowed(10L)).doesNotThrowAnyException();
        assertThatCode(() -> limiter.checkAllowed(10L)).doesNotThrowAnyException();
        assertThatCode(() -> limiter.checkAllowed(10L)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("1초 안에 4회째 요청은 차단한다")
    void rejectsFourthRequestWithinWindow() {
        MutableClock clock = new MutableClock(Instant.parse("2026-03-23T12:00:00Z"));
        GuardianRequestRateLimiter limiter = new GuardianRequestRateLimiter(clock);

        limiter.checkAllowed(10L);
        limiter.checkAllowed(10L);
        limiter.checkAllowed(10L);

        assertThatThrownBy(() -> limiter.checkAllowed(10L))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.GUARDIAN_REQUEST_RATE_LIMIT);
    }

    @Test
    @DisplayName("윈도우가 지나면 요청 수가 다시 초기화된다")
    void resetsAfterWindowExpires() {
        MutableClock clock = new MutableClock(Instant.parse("2026-03-23T12:00:00Z"));
        GuardianRequestRateLimiter limiter = new GuardianRequestRateLimiter(clock);

        limiter.checkAllowed(10L);
        limiter.checkAllowed(10L);
        limiter.checkAllowed(10L);
        clock.set(Instant.parse("2026-03-23T12:00:01.100Z"));

        assertThatCode(() -> limiter.checkAllowed(10L)).doesNotThrowAnyException();
    }

    private static final class MutableClock extends Clock {
        private final AtomicReference<Instant> currentInstant;

        private MutableClock(Instant initialInstant) {
            this.currentInstant = new AtomicReference<>(initialInstant);
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return currentInstant.get();
        }

        private void set(Instant nextInstant) {
            currentInstant.set(nextInstant);
        }
    }
}
