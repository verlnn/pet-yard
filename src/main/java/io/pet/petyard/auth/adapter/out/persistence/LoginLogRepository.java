package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.domain.model.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
}
