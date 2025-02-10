package movlit.be.auth.application.service;

import lombok.RequiredArgsConstructor;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.entity.MemberEntity;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
public class CustomArgumentResolver implements HandlerMethodArgumentResolver {

    private final MemberReadService memberReadService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType() == MemberEntity.class;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof MyMemberDetails) {
            MyMemberDetails memberDetails = (MyMemberDetails) authentication.getPrincipal();

            return memberDetails.getMember();
        }

        return null;
    }

}
