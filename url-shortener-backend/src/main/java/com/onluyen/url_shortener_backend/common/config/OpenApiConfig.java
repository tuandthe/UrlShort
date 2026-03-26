package com.onluyen.url_shortener_backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import java.util.List;

@Configuration
public class OpenApiConfig {

        @Value("${app.base-url:http://localhost:8080}")
        private String appBaseUrl;

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Url Shortener API")
                                                .version("1.0")
                                                .description("API quản lý rút gọn link")
                                                .contact(new Contact()
                                                                .name("Tuan")
                                                                .email("[EMAIL_ADDRESS]"))
                                                .license(new License()
                                                                .name("Apache 2.0")
                                                                .url("http://www.apache.org/licenses/LICENSE-2.0")))
                                .servers(List.of(
                                                new Server().url(appBaseUrl)
                                                                .description("Current Environment Server")))
                                // Thêm nút Authorize trên Swagger UI
                                .addSecurityItem(new SecurityRequirement().addList(AppConstant.SECURITY_SCHEME_NAME))
                                .components(new Components()
                                                .addSecuritySchemes(AppConstant.SECURITY_SCHEME_NAME,
                                                                new SecurityScheme()
                                                                                .name(AppConstant.SECURITY_SCHEME_NAME)
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("Nhập JWT token (không cần prefix 'Bearer ')")));
        }
}
