package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.LoadFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostHashtagPort;
import io.pet.petyard.feed.domain.model.FeedPostHashtag;
import io.pet.petyard.feed.domain.model.Hashtag;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class FeedHashtagPersistenceAdapter implements LoadFeedPostHashtagPort, SaveFeedPostHashtagPort {

    private final HashtagRepository hashtagRepository;
    private final FeedPostHashtagRepository feedPostHashtagRepository;

    public FeedHashtagPersistenceAdapter(HashtagRepository hashtagRepository,
                                         FeedPostHashtagRepository feedPostHashtagRepository) {
        this.hashtagRepository = hashtagRepository;
        this.feedPostHashtagRepository = feedPostHashtagRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<String>> findTagNamesByPostIds(List<Long> postIds) {
        Map<Long, List<String>> result = new HashMap<>();
        if (postIds == null || postIds.isEmpty()) {
            return result;
        }
        List<FeedPostHashtagRepository.PostTagRow> rows = feedPostHashtagRepository.findNamesByPostIds(postIds);
        for (FeedPostHashtagRepository.PostTagRow row : rows) {
            result.computeIfAbsent(row.getPostId(), key -> new ArrayList<>()).add(row.getName());
        }
        return result;
    }

    @Override
    @Transactional
    public void saveTags(Long postId, List<String> tags) {
        if (postId == null || tags == null || tags.isEmpty()) {
            return;
        }

        Set<String> uniqueTags = new HashSet<>(tags);
        if (uniqueTags.isEmpty()) {
            return;
        }

        List<Hashtag> existing = hashtagRepository.findByNameIn(uniqueTags);
        Map<String, Hashtag> byName = new HashMap<>();
        for (Hashtag hashtag : existing) {
            byName.put(hashtag.getName(), hashtag);
        }

        List<Hashtag> toCreate = new ArrayList<>();
        for (String name : uniqueTags) {
            if (!byName.containsKey(name)) {
                Hashtag hashtag = new Hashtag(name);
                toCreate.add(hashtag);
                byName.put(name, hashtag);
            }
        }

        if (!toCreate.isEmpty()) {
            hashtagRepository.saveAll(toCreate);
        }

        List<FeedPostHashtag> links = new ArrayList<>();
        for (String name : uniqueTags) {
            Hashtag hashtag = byName.get(name);
            if (hashtag != null && hashtag.getId() != null) {
                links.add(new FeedPostHashtag(postId, hashtag.getId()));
            }
        }

        if (!links.isEmpty()) {
            feedPostHashtagRepository.saveAll(links);
        }
    }
}
