import { bsc, bscTestnet } from "viem/chains";
const config = {
  chains: [bsc, bscTestnet],
  contract: {
    // [localhost.id]: "0xB73B8B1bFe6881596Be1F783D3c0Bd664C487971",
    [bsc.id]: "0xfF12a4Dc0248d913844EDC3aE97E06838F76E321",
    [bscTestnet.id]: "0x814C914921d495Cb0cDf4817e16739D4d37bf3b4",
  } as Record<number, `0x${string}`>,
};

export default config;
