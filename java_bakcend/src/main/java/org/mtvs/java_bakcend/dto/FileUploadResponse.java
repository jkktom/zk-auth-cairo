package org.mtvs.java_bakcend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    
    private Long id;
    private String filename;
    private String fileType;
    private Long fileSize;
    private String poseidonHash;
    private String authorAddress;
    private String starknetTxHash;
    private LocalDateTime createdAt;
    private String message;
}