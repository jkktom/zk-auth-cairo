package org.mtvs.java_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mtvs.java_backend.dto.FileUploadResponse;
import org.mtvs.java_backend.dto.FileVerificationResponse;
import org.mtvs.java_backend.entity.FileEntity;
import org.mtvs.java_backend.repository.FileRepository;
import org.mtvs.java_backend.util.PoseidonHashUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {
    
    private final FileRepository fileRepository;
    private final PoseidonHashUtil poseidonHashUtil;
    private final StarknetService starknetService;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    public FileUploadResponse uploadFile(MultipartFile file, String authorAddress) throws IOException {
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        // Generate Poseidon hash
        byte[] fileData = file.getBytes();
        String poseidonHash = poseidonHashUtil.generatePoseidonHash(fileData);
        
        // Check if file already exists
        if (fileRepository.existsByPoseidonHash(poseidonHash)) {
            throw new IllegalArgumentException("File with this hash already exists");
        }
        
        // Create file entity
        FileEntity fileEntity = FileEntity.builder()
                .filename(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .poseidonHash(poseidonHash)
                .authorAddress(authorAddress)
                .build();
        
        // Save to database
        FileEntity savedEntity = fileRepository.save(fileEntity);
        
        // Register on Starknet (async in real implementation)
        try {
            String txHash = starknetService.registerFileOnChain(
                poseidonHash, 
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize()
            );
            
            // Update with transaction hash
            savedEntity.setStarknetTxHash(txHash);
            fileRepository.save(savedEntity);
            
        } catch (Exception e) {
            log.error("Failed to register on Starknet: {}", e.getMessage());
            // Continue with local storage even if Starknet fails
        }
        
        return FileUploadResponse.builder()
                .id(savedEntity.getId())
                .filename(savedEntity.getFilename())
                .fileType(savedEntity.getFileType())
                .fileSize(savedEntity.getFileSize())
                .poseidonHash(savedEntity.getPoseidonHash())
                .authorAddress(savedEntity.getAuthorAddress())
                .starknetTxHash(savedEntity.getStarknetTxHash())
                .createdAt(savedEntity.getCreatedAt())
                .message("File uploaded and registered successfully")
                .build();
    }
    
    public FileVerificationResponse verifyFile(String poseidonHash) {
        Optional<FileEntity> fileEntity = fileRepository.findByPoseidonHash(poseidonHash);
        
        if (fileEntity.isEmpty()) {
            return FileVerificationResponse.builder()
                    .poseidonHash(poseidonHash)
                    .isRegistered(false)
                    .build();
        }
        
        FileEntity entity = fileEntity.get();
        String explorerUrl = generateStarknetExplorerUrl(entity.getStarknetTxHash());
        
        return FileVerificationResponse.builder()
                .id(entity.getId())
                .filename(entity.getFilename())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .poseidonHash(entity.getPoseidonHash())
                .authorAddress(entity.getAuthorAddress())
                .starknetTxHash(entity.getStarknetTxHash())
                .createdAt(entity.getCreatedAt())
                .isRegistered(true)
                .starknetExplorerUrl(explorerUrl)
                .build();
    }
    
    public List<FileVerificationResponse> getAllFiles() {
        return fileRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(entity -> FileVerificationResponse.builder()
                        .id(entity.getId())
                        .filename(entity.getFilename())
                        .fileType(entity.getFileType())
                        .fileSize(entity.getFileSize())
                        .poseidonHash(entity.getPoseidonHash())
                        .authorAddress(entity.getAuthorAddress())
                        .starknetTxHash(entity.getStarknetTxHash())
                        .createdAt(entity.getCreatedAt())
                        .isRegistered(true)
                        .starknetExplorerUrl(generateStarknetExplorerUrl(entity.getStarknetTxHash()))
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<FileVerificationResponse> getFilesByAuthor(String authorAddress) {
        return fileRepository.findByAuthorAddressOrderByCreatedAtDesc(authorAddress)
                .stream()
                .map(entity -> FileVerificationResponse.builder()
                        .id(entity.getId())
                        .filename(entity.getFilename())
                        .fileType(entity.getFileType())
                        .fileSize(entity.getFileSize())
                        .poseidonHash(entity.getPoseidonHash())
                        .authorAddress(entity.getAuthorAddress())
                        .starknetTxHash(entity.getStarknetTxHash())
                        .createdAt(entity.getCreatedAt())
                        .isRegistered(true)
                        .starknetExplorerUrl(generateStarknetExplorerUrl(entity.getStarknetTxHash()))
                        .build())
                .collect(Collectors.toList());
    }
    
    private String generateStarknetExplorerUrl(String txHash) {
        if (txHash == null || txHash.isEmpty()) {
            return null;
        }
        // Use Sepolia testnet explorer for demo
        return "https://sepolia.starkscan.co/tx/" + txHash;
    }
}