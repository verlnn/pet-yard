package io.pet.petyard.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({WalkController.class, BoardingController.class})
@AutoConfigureMockMvc(addFilters = false)
@org.springframework.context.annotation.Import(WebMvcSliceTestConfig.class)
class WalkBoardingControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ErrorLogService errorLogService;

    @Test
    @DisplayName("산책 게시물 목록 조회는 OK 메시지를 반환한다")
    void walkPostsReturnsOkMessage() throws Exception {
        mockMvc.perform(get("/api/walk/posts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value("ok"));
    }

    @Test
    @DisplayName("돌봄 신청은 applied 메시지를 반환한다")
    void boardingApplyReturnsApplied() throws Exception {
        mockMvc.perform(post("/api/boarding/apply"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value("applied"));
    }
}
