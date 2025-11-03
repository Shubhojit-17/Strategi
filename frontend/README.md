# Somnia AI Agents - FrontendThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Basic Next.js frontend for the Somnia AI Agents hackathon project.## Getting Started



## 🚀 Quick StartFirst, run the development server:



```bash```bash

npm installnpm run dev

npm run dev# or

```yarn dev

# or

Open http://localhost:3000pnpm dev

# or

## 📋 Featuresbun dev

```

- ✅ Wallet connection to Somnia L1

- ✅ Document upload to IPFSOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ✅ NFT minting with document CIDs

- ✅ AI agent executionYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- ✅ Blockchain verification viewer

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ⚙️ Configuration

## Learn More

Edit `.env.local`:

```envTo learn more about Next.js, take a look at the following resources:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

NEXT_PUBLIC_ACCESS_NFT_ADDRESS=0x... (after deployment)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x... (after deployment)- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

NEXT_PUBLIC_PROVENANCE_ADDRESS=0x... (after deployment)

```You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## 💡 Usage Flow## Deploy on Vercel



1. **Connect Wallet** → Connect MetaMask to Somnia L1The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

2. **Upload Document** → Upload file to IPFS, get CID

3. **Mint NFT** → Create Access NFT with document CIDCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

4. **Run AI** → Execute AI agent on your document
5. **Verify** → View results and blockchain proof

## 🛠️ Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- wagmi + viem (Web3)
- FastAPI backend integration

## 📝 Notes

Basic hackathon demo UI. Full production features (error handling, history, mobile, etc.) to be added later.

Make sure backend is running at `http://localhost:8000` before using!
