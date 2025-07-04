use starknet::ContractAddress;

#[starknet::interface]
pub trait IFileAuthRegistry<TContractState> {
    fn register_file(
        ref self: TContractState, 
        file_hash: felt252, 
        filename: ByteArray,
        file_type: ByteArray,
        file_size: u64
    );
    fn verify_file(self: @TContractState, file_hash: felt252) -> (ContractAddress, ByteArray, ByteArray, u64, u64);
    fn is_file_registered(self: @TContractState, file_hash: felt252) -> bool;
    fn get_author_files(self: @TContractState, author: ContractAddress) -> Array<felt252>;
}

#[derive(Drop, Serde, starknet::Store)]
pub struct FileInfo {
    pub author: ContractAddress,
    pub filename: ByteArray,
    pub file_type: ByteArray, 
    pub file_size: u64,
    pub timestamp: u64,
}

#[starknet::contract]
pub mod FileAuthRegistry {
    use super::{FileInfo, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess, Map};
    use core::num::traits::Zero;
    
    #[storage]
    struct Storage {
        files: Map<felt252, FileInfo>,
        author_files: Map<(ContractAddress, u32), felt252>,
        author_file_count: Map<ContractAddress, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        FileRegistered: FileRegistered,
    }

    #[derive(Drop, starknet::Event)]
    struct FileRegistered {
        #[key]
        file_hash: felt252,
        #[key] 
        author: ContractAddress,
        filename: ByteArray,
        file_type: ByteArray,
        file_size: u64,
        timestamp: u64,
    }

    #[abi(embed_v0)]
    impl FileAuthRegistryImpl of super::IFileAuthRegistry<ContractState> {
        fn register_file(
            ref self: ContractState,
            file_hash: felt252,
            filename: ByteArray, 
            file_type: ByteArray,
            file_size: u64
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Check if file already exists
            let existing_file = self.files.read(file_hash);
            assert(existing_file.author.is_zero(), 'File already registered');
            
            // Create file info
            let file_info = FileInfo {
                author: caller,
                filename: filename.clone(),
                file_type: file_type.clone(),
                file_size,
                timestamp,
            };
            
            // Store file info
            self.files.write(file_hash, file_info);
            
            // Add to author's file list
            let current_count = self.author_file_count.read(caller);
            self.author_files.write((caller, current_count), file_hash);
            self.author_file_count.write(caller, current_count + 1);
            
            // Emit event
            self.emit(FileRegistered {
                file_hash,
                author: caller,
                filename,
                file_type,
                file_size,
                timestamp,
            });
        }

        fn verify_file(self: @ContractState, file_hash: felt252) -> (ContractAddress, ByteArray, ByteArray, u64, u64) {
            let file_info = self.files.read(file_hash);
            assert(!file_info.author.is_zero(), 'File not registered');
            
            (file_info.author, file_info.filename, file_info.file_type, file_info.file_size, file_info.timestamp)
        }

        fn is_file_registered(self: @ContractState, file_hash: felt252) -> bool {
            let file_info = self.files.read(file_hash);
            !file_info.author.is_zero()
        }

        fn get_author_files(self: @ContractState, author: ContractAddress) -> Array<felt252> {
            let mut files = ArrayTrait::new();
            let count = self.author_file_count.read(author);
            
            let mut i = 0;
            while i < count {
                let file_hash = self.author_files.read((author, i));
                files.append(file_hash);
                i += 1;
            };
            
            files
        }
    }
}