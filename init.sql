CREATE INDEX idx_files_hash ON files(poseidon_hash);
CREATE INDEX idx_files_author ON files(author_address);
CREATE INDEX idx_files_created_at ON files(created_at);
