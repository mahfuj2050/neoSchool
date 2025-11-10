package com.rufan.fullstackbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.rufan.fullstackbackend")
public class FullstackBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FullstackBackendApplication.class, args);
    }

}
