package io.pet.petyard.feed.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.common.storage.FileStorageProperties;
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.feed.application.model.FeedPostPawResult;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.model.HomeFeedAuthorView;
import io.pet.petyard.feed.application.model.HomeFeedMediaView;
import io.pet.petyard.feed.application.model.HomeFeedPostView;
import io.pet.petyard.feed.application.model.HomeFeedReactionView;
import io.pet.petyard.feed.application.model.HomeFeedSlice;
import io.pet.petyard.feed.application.service.FeedCommentApplicationService;
import io.pet.petyard.feed.application.service.FeedApplicationService;
import io.pet.petyard.support.WebMvcSliceTestConfig;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;

@WebMvcTest(FeedController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class FeedControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private FeedApplicationService feedApplicationService;
    @MockitoBean private FeedCommentApplicationService feedCommentApplicationService;
    @MockitoBean private LocalFileStorage localFileStorage;
    @MockitoBean private LoadUserPort loadUserPort;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("홈 피드 조회는 cursor와 hasMore를 응답으로 반환한다")
    void homeFeedReturnsPage() throws Exception {
        given(feedApplicationService.listHomeFeed(any(), any(), any(), any()))
            .willReturn(new HomeFeedSlice(
                List.of(new HomeFeedPostView(
                    101L,
                    "산책 기록",
                    Instant.parse("2026-03-23T03:20:00Z"),
                    List.of("산책"),
                    new HomeFeedAuthorView(11L, "meongnyang.owner", "멍냥집사", "/profile.jpg", "NONE", false),
                    new HomeFeedMediaView("/thumb.jpg", List.of("/thumb.jpg"), List.of(), 1.0, "1:1"),
                    new HomeFeedReactionView(3L, true, 2L)
                )),
                Instant.parse("2026-03-23T03:20:00Z"),
                101L,
                true
            ));

        mockMvc.perform(get("/api/feeds")
                .param("limit", "10")
                .with(authPrincipalRequest(11L, UserTier.TIER_1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].id").value(101))
            .andExpect(jsonPath("$.items[0].authorUsername").value("meongnyang.owner"))
            .andExpect(jsonPath("$.items[0].authorNickname").value("멍냥집사"))
            .andExpect(jsonPath("$.items[0].commentCount").value(2))
            .andExpect(jsonPath("$.nextCursor.id").value(101))
            .andExpect(jsonPath("$.hasMore").value(true));
    }

    @Test
    @DisplayName("게시물 생성 실패는 400 에러 응답으로 변환된다")
    void createFailureReturnsBadRequest() throws Exception {
        given(feedApplicationService.create(any(), any(), any(), any()))
            .willThrow(new ApiException(ErrorCode.BAD_REQUEST));

        MockMultipartFile image = new MockMultipartFile("images", "dog.jpg", MediaType.IMAGE_JPEG_VALUE, "img".getBytes());

        mockMvc.perform(multipart("/api/feeds")
                .file(image)
                .param("content", "본문")
                .with(authPrincipalRequest(11L, UserTier.TIER_1)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    @DisplayName("발자국 추가는 현재 상태를 반환한다")
    void addPawReturnsReactionState() throws Exception {
        given(feedApplicationService.addPaw(11L, 101L))
            .willReturn(new FeedPostPawResult(101L, 4L, true));

        mockMvc.perform(post("/api/feeds/101/paws")
                .with(authPrincipalRequest(11L, UserTier.TIER_1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.postId").value(101))
            .andExpect(jsonPath("$.pawCount").value(4))
            .andExpect(jsonPath("$.pawedByMe").value(true));
    }

    @Test
    @DisplayName("게시물 삭제는 성공 시 200을 반환한다")
    void deleteReturns200() throws Exception {
        mockMvc.perform(delete("/api/feeds/101")
                .with(authPrincipalRequest(11L, UserTier.TIER_1)))
            .andExpect(status().isOk());
    }

    private Authentication authPrincipal(long userId, UserTier tier) {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(new AuthPrincipal(userId, tier), null, "ROLE_USER");
        authentication.setAuthenticated(true);
        return authentication;
    }

    private RequestPostProcessor authPrincipalRequest(long userId, UserTier tier) {
        Authentication authentication = authPrincipal(userId, tier);
        return request -> {
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
