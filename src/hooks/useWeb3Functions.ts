import config from "@/config";
import { useMemo } from "react";
import { useNetwork, useWalletClient } from "wagmi";
import { createPublicClient, http, getContract, zeroAddress } from "viem";
import CupcakePortalAbi from "@/contracts/abi/CupcakePortalAbi";
import { toast } from "react-toastify";

const useWeb3Functions = () => {
  const network = useNetwork();
  const { data: walletClient } = useWalletClient();
  const chain = useMemo(
    () =>
      network.chain && !network.chain.unsupported
        ? network.chain
        : config.chains[0],
    [network.chain]
  );
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: true },
      }),
    [chain]
  );

  const contract = useMemo(
    () =>
      getContract({
        address: config.contract[chain.id],
        abi: CupcakePortalAbi,
        publicClient,
        walletClient: walletClient || undefined,
      }),
    [chain, publicClient, walletClient]
  );

  const getLatestCupcake = async () => {
    const totalCupcakes = await contract.read.totalCupcakes();
    const cupcakes = await contract.read.getCupcake([
      totalCupcakes > 20n ? totalCupcakes - 20n - 1n : 1n,
      totalCupcakes,
    ]);
    return cupcakes.filter((item) => item.from !== zeroAddress);
  };

  const buyCupcake = async (message: string, value: bigint) => {
    if (!walletClient || !value) return;
    try {
      const { request } = await contract.simulate.buyCupcake([message], {
        value,
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Thank you for your cupcake! 🧁");
      return { hash };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.walk()?.message || error?.message || "Signing failed :("
      );
    }
  };

  const watchNewCupcake = (callback: (newCupcakes: Cupcake[]) => void) =>
    contract.watchEvent.NewCupcake(
      {},
      {
        onLogs: (logs) => {
          callback(
            logs
              .filter((log) => log.args.from !== zeroAddress)
              .map((log) => log.args as Cupcake)
          );
        },
      }
    );
  return { getLatestCupcake, buyCupcake, watchNewCupcake };
};

export default useWeb3Functions;
