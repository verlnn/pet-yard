package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.domain.model.User;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Set<User> findByIdIn(Collection<Long> ids);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
