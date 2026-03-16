package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.UserProfile;

public interface SaveUserProfilePort {
    UserProfile save(UserProfile profile);
}
