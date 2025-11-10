import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey("2EbRqaaFbjAsMVYbSZ4m4k2nLqhnjG1SxV6QgY8UnmzG");

export function getConfigPDA(configId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config"), new BN(configId).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
}

export function getAgentPDA(configId: number, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("agent"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      new BN(agentId).toArrayLike(Buffer, "le", 2)
    ],
    PROGRAM_ID
  );
}

export function getThemePDA(configId: number, themeId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("theme"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      themeId.toArrayLike(Buffer, "le", 8)
    ],
    PROGRAM_ID
  );
}

export function getThemeAgentPDA(theme: PublicKey, agent: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("theme_agent"), theme.toBuffer(), agent.toBuffer()],
    PROGRAM_ID
  );
}

export function getOptionStatePDA(theme: PublicKey, optionIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("option_state"), theme.toBuffer(), Buffer.from([optionIndex])],
    PROGRAM_ID
  );
}

export function getOptionVaultPDA(theme: PublicKey, optionIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("option_vault"), theme.toBuffer(), Buffer.from([optionIndex])],
    PROGRAM_ID
  );
}

export function getAgentVotePDA(theme: PublicKey, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent_vote"), theme.toBuffer(), new BN(agentId).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
}

export function getUserStakePDA(user: PublicKey, theme: PublicKey, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_stake"), user.toBuffer(), theme.toBuffer(), new BN(agentId).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
}

export function getAgentPerformancePDA(configId: number, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("agent_perf"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      new BN(agentId).toArrayLike(Buffer, "le", 2)
    ],
    PROGRAM_ID
  );
}

export function getAgentVaultPDA(theme: PublicKey, agent: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent_vault"), theme.toBuffer(), agent.toBuffer()],
    PROGRAM_ID
  );
}

export function getAgentVaultAuthorityPDA(theme: PublicKey, agent: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent_vault_authority"), theme.toBuffer(), agent.toBuffer()],
    PROGRAM_ID
  );
}

export function getOptionVaultAuthorityPDA(theme: PublicKey, optionIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("option_vault_authority"), theme.toBuffer(), Buffer.from([optionIndex])],
    PROGRAM_ID
  );
}
