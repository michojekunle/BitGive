import React from "react";
import { client, wallets, rootstockTestnet } from "@/lib/config";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";

const ConnectBtn = () => {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={darkTheme({
        colors: { accentText: "#F7931A" },
      })}
      chain={rootstockTestnet}
      connectButton={{
        label: "Sign In",
        style: {
          padding: "0.6rem 1.5rem", // py-1.5 px-5
          fontSize: "0.875rem", // text-sm
          backgroundColor: "#F7931A", // bg-white
          transition: "background-color 0.2s ease-in-out", // transition
          height: "auto",
          width: "auto",
          color: "white",
        },
      }}
      connectModal={{ size: "compact" }}
    />
  );
};

export default ConnectBtn;
