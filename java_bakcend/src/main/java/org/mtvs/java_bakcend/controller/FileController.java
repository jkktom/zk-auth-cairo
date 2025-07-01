package org.mtvs.java_bakcend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mtvs.java_bakcend.dto.FileUploadRequest;
import org.mtvs.java_bakcend.dto.FileUploadResponse;
import org.mtvs.java_bakcend.dto.FileVerificationResponse;
import org.mtvs.java_bakcend.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For demo purposes, configure properly in production
public class FileController {
    
    private final FileService fileService;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("authorAddress") String authorAddress) {
        
        try {
            log.info("Uploading file: {} from author: {}", file.getOriginalFilename(), authorAddress);
            
            FileUploadResponse response = fileService.uploadFile(file, authorAddress);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            
        } catch (IOException e) {
            log.error("IO error during file upload: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process file"));
            
        } catch (Exception e) {
            log.error("Unexpected error during file upload: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/verify/{poseidonHash}")
    public ResponseEntity<FileVerificationResponse> verifyFile(@PathVariable String poseidonHash) {
        log.info("Verifying file with hash: {}", poseidonHash);
        
        FileVerificationResponse response = fileService.verifyFile(poseidonHash);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<FileVerificationResponse>> getAllFiles() {
        log.info("Retrieving all files");
        
        List<FileVerificationResponse> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/author/{authorAddress}")
    public ResponseEntity<List<FileVerificationResponse>> getFilesByAuthor(@PathVariable String authorAddress) {
        log.info("Retrieving files for author: {}", authorAddress);
        
        List<FileVerificationResponse> files = fileService.getFilesByAuthor(authorAddress);
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "File Authentication API"));
    }
    
    // Helper method to create Map responses
    private static class Map {
        public static java.util.Map<String, String> of(String key, String value) {
            return java.util.Map.of(key, value);
        }
    }
}