package io.pet.petyard.terms.adapter.in.web;

import java.util.List;

public record TermsResponse(
    List<TermsItem> terms
) {
    public record TermsItem(
        String code,
        int version,
        String title,
        boolean mandatory,
        String contentUrl
    ) {
    }
}
