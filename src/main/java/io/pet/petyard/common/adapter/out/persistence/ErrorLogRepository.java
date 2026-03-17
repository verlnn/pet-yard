package io.pet.petyard.common.adapter.out.persistence;

import io.pet.petyard.common.domain.model.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {
}
