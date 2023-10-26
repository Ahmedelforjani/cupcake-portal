import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import config from "./config";
import { ThemeProvider } from "./components/theme-provider";
import { ToastContainer } from "react-toastify";
import { hexToHsl } from "./lib/utils";
import { isIframe } from "./lib/utils.ts";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const metadata = {
  name: "Cupcake portal",
};

const chains = config.chains;
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: chains[0] });

// global styles
const urlParams = new URLSearchParams(window.location.search);
const primary = urlParams.get("primary");
const theme = urlParams.get("theme") === "light" ? "light" : "dark";

if (primary) {
  document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  document.documentElement.style.setProperty("--ring", hexToHsl(primary));
}

if (isIframe) {
  document.body.classList.add("!bg-transparent");
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={theme} storageKey="vite-ui-theme">
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <ToastContainer theme={theme} position="top-center" />
    </ThemeProvider>
  );
}
