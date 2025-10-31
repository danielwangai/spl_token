import {
  percentAmount,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import secret from "./secret.json" with { type: "json" };
import * as fs from "fs";

const umi = createUmi("https://api.devnet.solana.com"); // Using Solana's public devnet RPC

const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

const metadata = {
  name: "Major Token",
  symbol: "MJT",
  uri: "https://images.unsplash.com/photo-1714808514968-d4457cbfcb09?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1680",
};

const mint = generateSigner(umi);
umi.use(signerIdentity(userWalletSigner));
umi.use(mplTokenMetadata());

createAndMint(umi, {
  mint,
  authority: umi.identity,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  sellerFeeBasisPoints: percentAmount(0),
  decimals: 8,
  amount: 1000000_00000000,
  tokenOwner: userWallet.publicKey,
  tokenStandard: TokenStandard.Fungible,
})
  .sendAndConfirm(umi)
  .then(() => {
    // Get the mint address as a string
    const mintAddress = mint.publicKey.toString();
    const tokenOwnerAddress = userWallet.publicKey.toString();
    
    console.log("\Successfully minted 1 million tokens!");
    console.log("Token Name:", metadata.name);
    console.log("Token Symbol:", metadata.symbol);
    console.log("Token Mint Address:", mintAddress);
    console.log("Token Owner (Wallet):", tokenOwnerAddress);
    console.log("Token Explorer:");
    console.log("Mint:", `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
    console.log("Owner:", `https://explorer.solana.com/address/${tokenOwnerAddress}?cluster=devnet`);
    console.log("\n");
    
    // Save mint address to a file for future reference
    const mintInfo = {
      mintAddress: mintAddress,
      tokenOwnerAddress: tokenOwnerAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      decimals: 8,
      amount: "1000000",
      createdAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      "mint-address.json",
      JSON.stringify(mintInfo, null, 2),
      "utf8"
    );
    
    console.log("Mint address saved to: mint-address.json");
  })
  .catch((err) => {
    console.error("Error minting tokens:", err);
  });
