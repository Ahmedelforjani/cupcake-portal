import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "./components/ui/button";
import config from "./config";
import useWeb3Functions from "./hooks/useWeb3Functions";
import { formatEther, parseEther } from "viem";
import { Loader2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-toastify";
import { cn, getPunkAvatar } from "./lib/utils";
dayjs.extend(relativeTime);

// get title from query params
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get("title");

function App() {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [message, setMessage] = useState("");
  const [value, setValue] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { buyCupcake, getLatestCupcake, watchNewCupcake } = useWeb3Functions();
  const [cupcakes, setCupcakes] = useState<Cupcake[]>([]);
  const [isCupcakeLoading, setIsCupcakeLoading] = useState(false);
  const currentChain = chain && !chain.unsupported ? chain : config.chains[0];

  const chainName =
    currentChain.name.split(" ").length > 1
      ? currentChain.name
          .split(" ")
          .map((word) => word[0])
          .join("")
      : currentChain.name;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address || (chain && chain?.unsupported) || !value) return;

    if (message.length > 140)
      return toast.error("Message is too long. Max 140 characters");

    if (Number(value) < 0.001)
      return toast.error(
        "Minimum value is 0.001 " + chain?.nativeCurrency.symbol
      );

    setIsLoading(true);
    const res = await buyCupcake(message, parseEther(`${value}`));

    if (res?.hash) {
      setMessage("");
      setValue("");

      getLatestCupcake().then(setCupcakes);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!chain?.unsupported) {
      const getCupcakes = async () => {
        setIsCupcakeLoading(true);
        const cupcakes = await getLatestCupcake();
        setCupcakes([...cupcakes]);
        setIsCupcakeLoading(false);
      };
      getCupcakes();

      const unwatch = watchNewCupcake((newCupcakes) =>
        setCupcakes((prev) =>
          prev[0].timestamp === newCupcakes[0].timestamp
            ? prev
            : [...newCupcakes, ...prev]
        )
      );

      return () => {
        unwatch();
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="flex-1 text-xl uppercase">
              {title || "Buy me cupcake 🧁"}
            </CardTitle>
            <Button
              onClick={() => open({ view: "Networks" })}
              variant={"outline"}
              type="button"
              className="w-auto rounded-full"
            >
              <img
                src={`https://icons.llamao.fi/icons/chains/rsz_${chainName}.jpg`}
                alt={chainName}
                className="object-contain w-6 h-6 mr-2 rounded-full"
                onError={(e) =>
                  (e.currentTarget.src = "/images/unknown-logo.png")
                }
              />

              {chainName}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="flex flex-col gap-1">
              <Input
                type="text"
                placeholder="Write a short message..."
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn({
                  "!border-destructive !ring-destructive": message.length > 140,
                })}
              />
              <span
                className={cn("text-xs text-right text-muted-foreground", {
                  "text-destructive font-semibold": message.length > 140,
                })}
              >
                {message.length}/140
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 group">
                <Input
                  className="flex-1"
                  type="number"
                  placeholder="0.001"
                  step={0.001}
                  required
                  value={`${value}`}
                  onChange={(e) => setValue(e.target.value)}
                />
                <span className="absolute top-0 right-0 flex items-center h-full px-3 border-l group-focus-within:border-primary">
                  ETH
                </span>
              </div>
              {!isConnected ? (
                <Button type="button" onClick={() => open()}>
                  Connect Wallet
                </Button>
              ) : chain?.unsupported ? (
                <Button
                  type="button"
                  onClick={() => switchNetwork?.(config.chains[0].id)}
                >
                  Switch Network
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2Icon size={16} className="mr-2 animate-spin" />
                  )}
                  Buy
                </Button>
              )}
            </div>
          </form>
          <div className="mt-6 border rounded-xl">
            {isCupcakeLoading ? (
              <div className="flex justify-center p-4">
                <Loader2Icon size={32} className="animate-spin" />
              </div>
            ) : cupcakes.length > 0 ? (
              <>
                <h4 className="p-4 text-lg">Latest cupcakes</h4>
                <TransitionGroup
                  component={"div"}
                  className="overflow-y-auto divide-y max-h-96"
                >
                  {cupcakes
                    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                    .map((item) => {
                      return (
                        <CSSTransition
                          classNames="fade"
                          key={item.timestamp}
                          timeout={700}
                        >
                          <div className="flex w-full min-w-0 gap-4 px-4 py-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted">
                              <img
                                src={getPunkAvatar(Number(item.timestamp))}
                                alt={item.from}
                                className="w-full h-full rounded-full aspect-square"
                              />
                            </div>
                            <div className="w-full min-w-0">
                              <a
                                className="font-semibold transition-all duration-300 hover:text-primary"
                                href={
                                  chain?.blockExplorers?.default.url
                                    ? `${chain?.blockExplorers?.default.url}/address/${item.from}`
                                    : "#"
                                }
                                target="_blank"
                              >
                                {item.from.slice(0, 6)}...
                                {item.from.slice(-4)}
                              </a>
                              <p className="w-full min-w-0 text-sm break-words text-muted-foreground">
                                {item.message}
                              </p>
                            </div>
                            <div className="flex-shrink-0 ml-auto text-right">
                              <p className="text-xs text-muted-foreground">
                                {dayjs.unix(Number(item.timestamp)).fromNow()}
                              </p>
                              <p className="font-semibold text-primary">
                                {Number(formatEther(item.value)).toLocaleString(
                                  undefined,
                                  { maximumSignificantDigits: 4 }
                                )}{" "}
                                {chain?.nativeCurrency.symbol}
                              </p>
                            </div>
                          </div>
                        </CSSTransition>
                      );
                    })}
                </TransitionGroup>
              </>
            ) : (
              <p className="p-4 text-sm text-center">
                Theres's cupcakes yet. Be the first to buy one.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
