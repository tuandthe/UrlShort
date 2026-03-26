package com.onluyen.url_shortener_backend.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Renders HTML email content from Thymeleaf templates.
 * Templates are located in: src/main/resources/templates/email/
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailTemplateRenderer {

    private final TemplateEngine templateEngine;

    /**
     * Renders a Thymeleaf template to an HTML string.
     *
     * @param templateName template file name without path or extension (e.g., "welcome")
     * @param variables    map of variables injected into the template context
     * @return rendered HTML string
     */
    public String render(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            variables.forEach(context::setVariable);
        }

        String fullTemplateName = "email/" + templateName;
        log.debug("Rendering email template: {}", fullTemplateName);
        return templateEngine.process(fullTemplateName, context);
    }
}
