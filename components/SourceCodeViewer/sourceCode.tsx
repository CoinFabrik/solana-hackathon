"use client";
// @ts-ignore
import codePrettify from "code-prettify";
import { Button } from "@/components/ui/button";
import * as anchor from "@coral-xyz/anchor";

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

  const runCode = async () => {
    if (typeof window !== "undefined") {
      console.log(source);
      let tests: Array<[string, Function]> = [];
      let results: Array<[boolean, string]> = [];
      (window as any).anchor = anchor;
      (window as any).it = (desc: string, fun: Function) => {
        tests.push([desc, fun]);
      };
      (window as any).assert = (bool: boolean, expected: string) => {
        results.push([bool, expected]);
      };
      anchor.setProvider(
        new AnchorProvider(
          new Connection(
            programsManager.networkInfo.networks[
              programsManager.networkInfo.selectedNetwork
            ].url
          ),
          new VirtualWallet(Keypair.generate()),
          AnchorProvider.defaultOptions()
        )
      );
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
