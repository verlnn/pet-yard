package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.User;

public interface SaveUserPort {
    User save(User user);
}
