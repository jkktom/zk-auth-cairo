package org.mtvs.java_bakcend.repository;

import org.mtvs.java_bakcend.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    
    Optional<FileEntity> findByPoseidonHash(String poseidonHash);
    
    List<FileEntity> findByAuthorAddressOrderByCreatedAtDesc(String authorAddress);
    
    boolean existsByPoseidonHash(String poseidonHash);
    
    List<FileEntity> findAllByOrderByCreatedAtDesc();
}