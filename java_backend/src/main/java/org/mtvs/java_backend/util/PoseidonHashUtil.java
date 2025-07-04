package org.mtvs.java_backend.util;

import org.bouncycastle.crypto.digests.KeccakDigest;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;

@Component
public class PoseidonHashUtil {
    
    private static final BigInteger FIELD_SIZE = new BigInteger("3618502788666131213697322783095070105623107215331596699973092056135872020481");
    
    /**
     * Simplified Poseidon-like hash function for demo purposes.
     * In production, this should use a proper Poseidon hash implementation
     * that matches the Cairo/Starknet implementation.
     */
    public String generatePoseidonHash(byte[] fileData) {
        // For demo purposes, we'll use Keccak and map to field
        // In production, use actual Poseidon hash that matches Cairo
        KeccakDigest keccak = new KeccakDigest(256);
        keccak.update(fileData, 0, fileData.length);
        
        byte[] hash = new byte[32];
        keccak.doFinal(hash, 0);
        
        // Convert to BigInteger and reduce modulo field size
        BigInteger hashValue = new BigInteger(1, hash);
        BigInteger reducedHash = hashValue.mod(FIELD_SIZE);
        
        // Convert to hex string with 0x prefix (felt252 format)
        return "0x" + reducedHash.toString(16);
    }
    
    /**
     * Generate hash from file content as string
     */
    public String generatePoseidonHashFromString(String content) {
        return generatePoseidonHash(content.getBytes(StandardCharsets.UTF_8));
    }
    
    /**
     * Validate if a hash string is a valid felt252
     */
    public boolean isValidFelt252(String hash) {
        if (hash == null || !hash.startsWith("0x")) {
            return false;
        }
        
        try {
            BigInteger value = new BigInteger(hash.substring(2), 16);
            return value.compareTo(FIELD_SIZE) < 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}