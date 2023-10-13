import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgramsManagerContext } from "@/services/programLoader";
import { AccountsManagerContext } from "@/services/accountsManager";
import { KeyManagerContext } from "@/services/keysManager";

import * as web3 from "@solana/web3.js";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import VirtualWallet from "@/services/virtualWallet";
import { ToastContainer, toast } from "react-toastify";
import * as anchor from "@coral-xyz/anchor";

const RunAndResetButtons = ({ sourceCode }: { sourceCode: any }) => {
  const programsManager = useContext(ProgramsManagerContext);
  const accountsManager = useContext(AccountsManagerContext);
  const keyManager = useContext(KeyManagerContext);
  const handleClearAndReload = () => {
    programsManager.clear();
    accountsManager.clear();
    keyManager.clear();
  };

  const [keyPair, setKeypair] = useState(null as any);
  if (keyPair == null) {
    setKeypair(Keypair.generate());
  }
  const runCode = async () => {
    toast.info("Running tests... This could take a while.");
    if (typeof window !== "undefined") {
      let tests: Array<[string, Function]> = [];
      let results: Array<[boolean, string]> = [];
      (window as any).anchor = anchor;
      (window as any).web3 = web3;
      (window as any).it = (desc: string, fun: Function) => {
        tests.push([desc, fun]);
      };
      (window as any).assert = (bool: boolean, expected: string) => {
        results.push([bool, expected]);
      };
      let conn = new Connection(
        programsManager.networkInfo.networks[
          programsManager.networkInfo.selectedNetwork
        ].url
      );
      await conn.requestAirdrop(keyPair.publicKey, 1e9);
      (window as any).connection = conn;
      let provider = new AnchorProvider(conn, new VirtualWallet(keyPair), {
        commitment: "confirmed",
      });
      anchor.setProvider(provider);
      (window as any).provider = provider;

      let asyncfunc = eval(`async ()=>{${sourceCode}}`);
      await asyncfunc();
      for (let test of tests) {
        results = [];
        console.log("Running test:", test[0]);
        let testResult = await test[1]();
        if (results.every((result) => result[0])) {
          // All assertions passed
          toast.success(`Test "${test[0]}" PASSED`);
        } else {
          // Some assertions failed
          let resMsg = results
            .filter((result) => !result[0])
            .reduce((msg, result) => {
              return `${msg}Assert failed: expected ${result[1]}\n`;
            }, "");
          toast.error(`Test "${test[0]}" FAILED\n${resMsg}`);
        }
      }
    }
  };

  return (
    <span className="space-x-4">
      <Button
        onClick={handleClearAndReload}
        className="bg-[#9945FF] text-zinc-50 hover:bg-purple-700 text-2xl"
        title="Clear all data and start over"
      >
        CLEAR ALL
      </Button>
      <Button
        onClick={runCode}
        className="bg-[#9945FF] text-zinc-50 hover:bg-purple-700 text-2xl"
        title="Run the generated code"
      >
        RUN
      </Button>
    </span>
  );
};

export default RunAndResetButtons;
