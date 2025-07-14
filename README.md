# ZK-Auth Cairo

A comprehensive zero-knowledge authentication system for file verification, built on Starknet with a full-stack implementation.

## 🎯 Overview

This project implements a decentralized file authentication system using Cairo smart contracts on Starknet, combined with a modern web interface and Java backend. Files are registered on-chain with immutable timestamps and cryptographic hashes, enabling trustless verification of authenticity and provenance.

## 🏗️ Architecture

### Components
- **Cairo Smart Contract**: File authentication registry deployed on Starknet
- **Next.js Frontend**: Modern React interface for file upload and verification
- **Java Backend**: Spring Boot API for file processing and blockchain integration
- **Starknet Integration**: Zero-knowledge proof verification system

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, React 19
- **Backend**: Spring Boot 3.5, JPA, Lombok
- **Smart Contract**: Cairo, Starknet
- **Network**: Starknet Sepolia Testnet

## 🚀 Deployed Contract

**Contract Address**: `0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0`

**Explorer**: [View on Starkscan](https://sepolia.starkscan.co/contract/0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0)

Test it with your own wallet (account) or, Just use `0x06ecb9425da32b868721a6b9dd609879eb81d6b80494bff9dcf2e3b002801d2f` to see if it works. (Thanks to Starknet sepolia faucet)

### Contract Functions
- `register_file()` - Register a new file with metadata
- `verify_file()` - Verify file authenticity and get details
- `is_file_registered()` - Check if file exists in registry
- `get_author_files()` - Get all files by author

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Starknet Foundry (for contract interaction)

### Frontend Setup
```bash
cd next_frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd java_backend
./gradlew bootRun
```

### Contract Interaction
```bash
# Verify file registration
sncast call --contract-address 0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0 --function "is_file_registered" --calldata <file_hash>

# Register new file
sncast invoke --contract-address 0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0 --function "register_file" --calldata <file_hash> <filename> <file_type> <file_size>
```

## 📁 Project Structure

```
zk-auth-cairo/
├── next_frontend/          # Next.js frontend application
├── java_backend/           # Spring Boot backend API
├── cairo/                  # Cairo smart contracts
├── local_resources/        # Documentation and resources
└── docker-compose.yml      # Container orchestration
```

## 🔧 Development Commands

### Frontend
```bash
cd next_frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

### Backend
```bash
cd java_backend
./gradlew bootRun    # Run application
./gradlew build      # Build project
./gradlew test       # Run tests
```

### Smart Contract
```bash
# Interact with deployed contract
sncast call --contract-address 0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0 --function <function_name> --calldata <args>

# For contract development/testing (optional)
cd cairo
scarb build          # Compile contracts
snforge test         # Run tests
```

## 💡 Use Cases

### Document Authentication
- Upload sensitive documents with cryptographic verification
- Immutable proof of existence and timestamp
- Creator attribution and ownership tracking

### Digital Asset Provenance
- Track creation and modification history
- Verify file integrity across distributed systems
- Establish priority claims for intellectual property

### Academic Research
- Timestamp research submissions
- Prevent plagiarism disputes
- Establish publication priority

## 🔐 Security Features

- **Immutable Records**: Files cannot be modified after registration
- **Cryptographic Hashes**: SHA-256 file fingerprinting
- **Zero-Knowledge Proofs**: Privacy-preserving verification
- **Decentralized Storage**: No single point of failure
- **Timestamp Integrity**: Block-level time verification

## 🌐 API Integration

### JavaScript/TypeScript
```javascript
import { Contract, Provider } from 'starknet';

const contractAddress = '0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0';
const provider = new Provider({ sequencer: { network: 'sepolia-alpha' } });

// Verify file registration
const contract = new Contract(abi, contractAddress, provider);
const isRegistered = await contract.is_file_registered(fileHash);
```

### Python
```python
from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.contract import Contract

client = FullNodeClient(node_url="https://starknet-sepolia.public.blastapi.io/rpc/v0_8")
contract = await Contract.from_address(contract_address, client)
result = await contract.functions["verify_file"].call(file_hash)
```

## 📊 Cost Analysis

### Gas Costs (Sepolia Testnet)
- **File Registration**: ~0.0001-0.0005 ETH
- **File Verification**: Free (read-only)
- **Account Setup**: ~0.001 ETH (one-time)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet Documentation](https://book.starknet.io/)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)
- [Contract Usage Guide](./local_resources/deployment_summary_and_usage.md)

## 🏆 Roadmap

- [ ] Multi-signature verification
- [ ] Advanced file metadata support
- [ ] Mainnet deployment (when ready)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Starknet Foundation for ZK infrastructure
- OpenZeppelin for security patterns
- Cairo community for development tools

---

**🎉 Live Demo**: [View Contract on Starkscan](https://sepolia.starkscan.co/contract/0x06ebf0234be358bd087fdf5165d4b5cf7103fa1d00b8a4edb32b6e61b6d764f0)