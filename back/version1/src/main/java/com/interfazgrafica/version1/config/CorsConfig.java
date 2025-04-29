package com.interfazgrafica.version1.config;

/*Cuando defines un método con la anotación @Bean dentro de una clase marcada con @Configuration,
 Spring lo reconoce y lo registra como un componente administrado, lo que significa que puede ser
  inyectado y utilizado en otros lugares de la aplicación. */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad que impide que un sitio web haga
 peticiones AJAX a un dominio diferente del que lo sirve, a menos que el servidor permita explícitamente
estas solicitudes.

Ejemplo de problema CORS:
Si tienes una API en http://localhost:8080 y un frontend en http://localhost:5173, el navegador bloqueará 
las solicitudes entre ambos, a menos que el backend permita el acceso con CORS. */

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173") // React app
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }
}
