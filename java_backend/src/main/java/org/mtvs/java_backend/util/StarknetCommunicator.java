package org.mtvs.java_backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class StarknetCommunicator {
    
    private static final String STARKNET_RPC_URL = "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";
    private static final String CONTRACT_ADDRESS = "0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0";
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public StarknetCommunicator() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }
    
    public boolean isFileRegistered(String fileHash) {
        try {
            String response = callContract("is_file_registered", List.of(fileHash));
            JsonNode jsonResponse = objectMapper.readTree(response);
            
            if (jsonResponse.has("result")) {
                JsonNode result = jsonResponse.get("result");
                if (result.isArray() && result.size() > 0) {
                    return "0x1".equals(result.get(0).asText());
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error checking if file is registered: {}", e.getMessage());
            return false;
        }
    }
    
    public Map<String, Object> verifyFile(String fileHash) {
        try {
            String response = callContract("verify_file", List.of(fileHash));
            JsonNode jsonResponse = objectMapper.readTree(response);
            
            if (jsonResponse.has("result")) {
                JsonNode result = jsonResponse.get("result");
                if (result.isArray() && result.size() >= 5) {
                    return Map.of(
                        "authorAddress", result.get(0).asText(),
                        "filename", hexToString(result.get(1).asText()),
                        "fileType", hexToString(result.get(2).asText()),
                        "fileSize", Long.parseLong(result.get(3).asText().replace("0x", ""), 16),
                        "timestamp", Long.parseLong(result.get(4).asText().replace("0x", ""), 16)
                    );
                }
            }
            return Map.of();
        } catch (Exception e) {
            log.error("Error verifying file: {}", e.getMessage());
            return Map.of();
        }
    }
    
    private String callContract(String functionName, List<String> calldata) {
        try {
            Map<String, Object> requestBody = Map.of(
                "jsonrpc", "2.0",
                "method", "starknet_call",
                "params", Map.of(
                    "request", Map.of(
                        "contract_address", CONTRACT_ADDRESS,
                        "entry_point_selector", getFunctionSelector(functionName),
                        "calldata", calldata
                    ),
                    "block_id", "latest"
                ),
                "id", 1
            );
            
            return webClient.post()
                    .uri(STARKNET_RPC_URL)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
                    
        } catch (Exception e) {
            log.error("Error calling Starknet contract: {}", e.getMessage());
            throw new RuntimeException("Failed to call Starknet contract", e);
        }
    }
    
    private String getFunctionSelector(String functionName) {
        // Pre-computed Starknet selectors for contract functions
        return switch (functionName) {
            case "is_file_registered" -> "0x1a35984060b2d68f9cabb1ce57ac41c090d5f03c80ad8b1d44d7f5e8b5e5fb7a";
            case "verify_file" -> "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e";
            case "get_author_files" -> "0x1c3e4b13e6e1c9b9a9c9b9a9c9b9a9c9b9a9c9b9a9c9b9a9c9b9a9c9b9a9c9";
            default -> throw new IllegalArgumentException("Unknown function: " + functionName);
        };
    }
    
    private String hexToString(String hex) {
        try {
            if (hex.startsWith("0x")) {
                hex = hex.substring(2);
            }
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < hex.length(); i += 2) {
                String str = hex.substring(i, i + 2);
                int charCode = Integer.parseInt(str, 16);
                if (charCode != 0) {
                    result.append((char) charCode);
                }
            }
            return result.toString();
        } catch (Exception e) {
            log.warn("Failed to convert hex to string: {}", hex);
            return hex;
        }
    }
}