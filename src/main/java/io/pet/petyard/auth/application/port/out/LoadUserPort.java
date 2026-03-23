package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.User;

import java.util.Optional;

public interface LoadUserPort {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findById(Long id);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
