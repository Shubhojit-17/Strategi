# Strategi - AI-Powered Document Management on Blockchain

A decentralized document management system that leverages AI for document processing, NFT-based authentication, and blockchain provenance tracking on the Somnia L1 network.

## 🚀 Features

- **NFT-Based Authentication**: Secure access control using NFT ownership verification
- **AI Document Processing**: Intelligent document analysis and processing using Gemini AI
- **Blockchain Provenance**: Immutable document history and provenance tracking on Somnia L1
- **IPFS Storage**: Decentralized file storage with Pinata pinning service
- **Modern Web Interface**: Next.js frontend with Wagmi wallet integration
- **FastAPI Backend**: High-performance Python backend with Web3 integration

## 🏗️ Architecture

### Backend (FastAPI)
- **Main Application**: `agent/app/main.py` - Core API endpoints
- **NFT Authentication**: `agent/app/nft_auth.py` - Web3-based access control
- **Blockchain Integration**: `agent/app/chains.py` - Somnia L1 network interactions
- **AI Processing**: Integration with Google Gemini for document analysis

### Frontend (Next.js)
- **Documents Gateway**: `frontend/components/documents/DocumentsGateway.tsx` - Main document interface
- **Wallet Integration**: Wagmi hooks for MetaMask connection
- **Responsive Design**: Tailwind CSS with Framer Motion animations

### Smart Contracts
- **NFT Contract**: ERC-721 implementation for access tokens
- **Document Registry**: On-chain document provenance tracking

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, Uvicorn
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: Web3.py, Somnia Testnet
- **Storage**: IPFS, Pinata
- **AI**: Google Gemini AI
- **Database**: SQLite (local caching)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MetaMask wallet
- Somnia testnet access

### Backend Setup
```bash
cd agent
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Configuration
Create `.env` files in both `agent/` and `frontend/` directories with:
- Web3 provider URLs
- IPFS/Pinata credentials
- AI API keys
- Database paths

## 📁 Project Structure

```
├── agent/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py       # Main application
│   │   ├── nft_auth.py   # NFT authentication
│   │   └── chains.py     # Blockchain integration
│   └── requirements.txt
├── frontend/              # Next.js frontend
│   ├── components/
│   │   └── documents/    # Document components
│   └── lib/              # Utilities and hooks
├── contracts/             # Smart contracts
├── documentation/         # Project docs
└── logs/                  # Application logs
```

## 🔐 Authentication Flow

1. User connects MetaMask wallet
2. System verifies NFT ownership (Token ID: 1)
3. Upon successful verification, user gains access to document management features
4. All document operations are recorded on-chain for provenance

## 📄 API Endpoints

- `GET /documents` - List user's documents
- `POST /upload` - Upload new document with AI processing
- `POST /execute` - Execute AI operations on documents
- `GET /health` - Health check endpoint

## 🧪 Testing

Run comprehensive tests:
```bash
# Backend tests
python test_full_system.py

# Frontend tests
cd frontend && npm test
```

## 📊 Monitoring

- Application logs available in `logs/` directory
- Health check endpoint for system monitoring
- Blockchain transaction monitoring via Somnia explorer

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

This project is developed for the DevTrack Hackathon.

## 🏆 Hackathon Context

This application was built for the DevTrack Hackathon, demonstrating:
- Decentralized document management
- AI integration with blockchain
- Modern web development practices
- Cross-chain interoperability

---

**Note**: Ensure all environment variables are properly configured before deployment. The system requires active Somnia testnet connection and valid API credentials for full functionality.
