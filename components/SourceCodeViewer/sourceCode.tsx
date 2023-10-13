"use client";
// @ts-ignore
import codePrettify from "code-prettify";
import { Button } from "@/components/ui/button";
import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";

import React, { useContext, useState } from "react";
import "./sourceCode.css";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import VirtualWallet from "@/services/virtualWallet";
import { ProgramsManagerContext } from "@/services/programLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SourceCode = ({ source, ...props }: { source: any }) => {
  const programsManager = useContext(ProgramsManagerContext);
  const [keyPair, setKeypair] = useState(null as any);
  if(keyPair == null){
    setKeypair(Keypair.generate());
  }
  const runCode = async () => {
    if (typeof window !== "undefined") {
      let tests: Array<[string, Function]> = [];
      let results: Array<[boolean, string]> = [];
      (window as any).anchor = anchor;
      (window as any).web3 = web3;
      (window as any).it = (desc: string, fun: Function) => {
        tests.push([desc, fun]);
      };
      (window as any).assert = (bool: boolean, expected: string) => {
        console.log("Assert", [bool, expected]);
        results.push([bool, expected]);
      };
      let conn = new Connection(
        programsManager.networkInfo.networks[
          programsManager.networkInfo.selectedNetwork
        ].url
      );
      await conn.requestAirdrop(keyPair.publicKey, 1e9);
      (window as any).connection = conn;
      let provider = new AnchorProvider(
        conn,
        new VirtualWallet(keyPair),
        {
          commitment: "confirmed"
      });
      anchor.setProvider(provider);
      (window as any).provider = provider;
      
      let asyncfunc = eval(`async ()=>{${source}}`);
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
    <>
      <div className="overflow-auto ">
        <pre className="prettyprint">
          <code
            className="javascript"
            dangerouslySetInnerHTML={{
              __html: codePrettify.prettyPrintOne(source),
            }}
          ></code>
        </pre>
      </div>
      <Button onClick={runCode}>RUN</Button>
      <ToastContainer />
    </>
  );
};

export default SourceCode;
