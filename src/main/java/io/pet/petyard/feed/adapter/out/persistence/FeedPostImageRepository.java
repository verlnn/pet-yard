package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPostImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedPostImageRepository extends JpaRepository<FeedPostImage, Long> {
    List<FeedPostImage> findByPostIdInOrderByPostIdAscSortOrderAsc(List<Long> postIds);
}
