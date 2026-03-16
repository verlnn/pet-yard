package io.pet.petyard.terms.adapter.in.web;

import io.pet.petyard.terms.application.port.out.LoadTermsPort;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/terms")
public class TermsController {

    private final LoadTermsPort loadTermsPort;

    public TermsController(LoadTermsPort loadTermsPort) {
        this.loadTermsPort = loadTermsPort;
    }

    @GetMapping
    public TermsResponse list() {
        List<TermsResponse.TermsItem> terms = loadTermsPort.findAll().stream()
            .map(t -> new TermsResponse.TermsItem(t.getCode(), t.getVersion(), t.getTitle(), t.isMandatory(), t.getContentUrl()))
            .toList();
        return new TermsResponse(terms);
    }
}
