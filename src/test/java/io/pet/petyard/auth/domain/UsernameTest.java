package io.pet.petyard.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UsernameTest {

    @Test
    @DisplayName("정상 username은 그대로 저장 가능한 값으로 정규화된다")
    void validUsernameIsAccepted() {
        assertThat(Username.fromRaw("meongnyang.owner_1").value()).isEqualTo("meongnyang.owner_1");
    }

    @Test
    @DisplayName("대문자 입력은 소문자로 정규화된다")
    void uppercaseIsNormalizedToLowercase() {
        assertThat(Username.fromRaw("PetYard.Owner").value()).isEqualTo("petyard.owner");
    }

    @Test
    @DisplayName("한글이 포함된 username은 거부한다")
    void koreanCharactersAreRejected() {
        assertThatThrownBy(() -> Username.fromRaw("멍냥owner"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("허용되지 않은 특수문자가 포함된 username은 거부한다")
    void unsupportedSpecialCharactersAreRejected() {
        assertThatThrownBy(() -> Username.fromRaw("owner!test"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("마침표로 시작하는 username은 거부한다")
    void leadingDotIsRejected() {
        assertThatThrownBy(() -> Username.fromRaw(".owner"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("연속된 마침표가 있는 username은 거부한다")
    void doubleDotIsRejected() {
        assertThatThrownBy(() -> Username.fromRaw("owner..test"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("마침표로 끝나는 username은 거부한다")
    void trailingDotIsRejected() {
        assertThatThrownBy(() -> Username.fromRaw("owner."))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("30자를 초과하는 username은 거부한다")
    void longerThanThirtyCharactersIsRejected() {
        assertThatThrownBy(() -> Username.fromRaw("a".repeat(31)))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
