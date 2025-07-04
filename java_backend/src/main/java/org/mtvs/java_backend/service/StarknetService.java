package org.mtvs.java_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.mtvs.java_backend.util.StarknetCommunicator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class StarknetService {
    
    private static final String CONTRACT_ADDRESS = "0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0";
    private static final String EXPLORER_BASE_URL = "https://sepolia.starkscan.co";
    
    @Autowired
    private StarknetCommunicator starknetCommunicator;
    
    public String registerFileOnChain(String poseidonHash, String filename, String fileType, long fileSize) {
        log.info("Registering file on Starknet - Hash: {}, Filename: {}, Type: {}, Size: {}", 
                poseidonHash, filename, fileType, fileSize);
        
        // Note: For now returning mock hash as actual contract interaction requires private key
        // In production, this would:
        // 1. Connect to Starknet with account
        // 2. Call the register_file function on deployed contract
        // 3. Return actual transaction hash
        
        String mockTxHash = "0x" + Long.toHexString(System.currentTimeMillis()) + 
                           Long.toHexString(poseidonHash.hashCode()).substring(0, 8);
        
        log.info("Generated transaction hash: {}", mockTxHash);
        return mockTxHash;
    }
    
    public boolean verifyFileOnChain(String poseidonHash) {
        log.info("Verifying file on Starknet - Hash: {}", poseidonHash);
        
        try {
            return starknetCommunicator.isFileRegistered(poseidonHash);
        } catch (Exception e) {
            log.error("Error verifying file on Starknet: {}", e.getMessage());
            return false;
        }
    }
    
    public Map<String, Object> getFileDetailsFromChain(String poseidonHash) {
        log.info("Getting file details from Starknet - Hash: {}", poseidonHash);
        
        try {
            return starknetCommunicator.verifyFile(poseidonHash);
        } catch (Exception e) {
            log.error("Error getting file details from Starknet: {}", e.getMessage());
            return Map.of();
        }
    }
    
    public String getContractAddress() {
        return CONTRACT_ADDRESS;
    }
    
    public String getExplorerUrl(String txHash) {
        return EXPLORER_BASE_URL + "/tx/" + txHash;
    }
    
    public String getContractExplorerUrl() {
        return EXPLORER_BASE_URL + "/contract/" + CONTRACT_ADDRESS;
    }
}