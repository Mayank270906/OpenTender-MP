import { Buffer } from "buffer";
import { keccak256, solidityPacked } from "ethers";
import * as Random from "expo-random";

export function generateSecretKey() {
  const bytes = Random.getRandomBytes(16);
  return Buffer.from(bytes).toString("hex");
}

export function generateCommitment(amount, secret) {
  return keccak256(
    solidityPacked(["uint256", "string"], [amount.toString(), secret])
  );
}
