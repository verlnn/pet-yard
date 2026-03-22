package io.pet.petyard.support;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.storage.FileStorageProperties;
import java.util.List;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@TestConfiguration(proxyBeanMethods = false)
public class WebMvcSliceTestConfig implements WebMvcConfigurer {

    @Bean
    FileStorageProperties fileStorageProperties() {
        return new FileStorageProperties("/tmp/petyard-test-uploads", "/uploads");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                    && AuthPrincipal.class.isAssignableFrom(parameter.getParameterType());
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                Authentication authentication = null;
                var requestPrincipal = webRequest.getUserPrincipal();
                if (requestPrincipal instanceof Authentication requestAuthentication) {
                    authentication = requestAuthentication;
                } else {
                    authentication = SecurityContextHolder.getContext().getAuthentication();
                }
                if (authentication != null && authentication.getPrincipal() instanceof AuthPrincipal authPrincipal) {
                    return authPrincipal;
                }
                return null;
            }
        });
    }
}
