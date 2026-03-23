package io.pet.petyard.user.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Component;

@Component
public class GuardianRequestRateLimiter {

    private static final Duration WINDOW = Duration.ofSeconds(1);
    private static final int MAX_REQUESTS_PER_WINDOW = 3;

    private final Clock clock;
    private final ConcurrentMap<Long, Deque<Instant>> requestsByUserId = new ConcurrentHashMap<>();

    public GuardianRequestRateLimiter() {
        this(Clock.systemUTC());
    }

    GuardianRequestRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(Long requesterUserId) {
        Deque<Instant> requestTimes = requestsByUserId.computeIfAbsent(requesterUserId, ignored -> new ArrayDeque<>());
        Instant now = clock.instant();
        Instant cutoff = now.minus(WINDOW);

        synchronized (requestTimes) {
            while (!requestTimes.isEmpty() && requestTimes.peekFirst().isBefore(cutoff)) {
                requestTimes.pollFirst();
            }
            if (requestTimes.size() >= MAX_REQUESTS_PER_WINDOW) {
                throw new ApiException(ErrorCode.GUARDIAN_REQUEST_RATE_LIMIT);
            }
            requestTimes.addLast(now);
        }
    }
}
