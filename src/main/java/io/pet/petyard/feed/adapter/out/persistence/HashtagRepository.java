package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.Hashtag;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    List<Hashtag> findByNameIn(Collection<String> names);

    Optional<Hashtag> findByName(String name);
}
