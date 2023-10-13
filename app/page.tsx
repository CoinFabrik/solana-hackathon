"use client";
import React, { useContext, useState } from "react";
import BlocklyComponent from "@/components/Blockly/BlocklyComponent";
//import { Split } from "@geoffcox/react-splitter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SourceCode from "@/components/SourceCodeViewer/sourceCode";
import SideBar from "@/components/sideBar";
import { AccountsManagerProvider } from "@/services/accountsManager";
import { KeyManagerProvider } from "@/services/keysManager";
import { ProgramsManagerProvider } from "@/services/programLoader";
import toolbox from "@/components/Blockly/defaultToolbox.json";
import dynamic from "next/dynamic";
import RunAndResetButtons from "../components/clearstorage";
import * as anchor from "@coral-xyz/anchor";

import * as web3 from "@solana/web3.js";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import VirtualWallet from "@/services/virtualWallet";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "@/components/ui/button";

import { ProgramsManagerContext } from "@/services/programLoader";
import { AccountsManagerContext } from "@/services/accountsManager";
import { KeyManagerContext } from "@/services/keysManager";

import BasicModal from "@/components/instructions";
const Split = dynamic(
  () => import("@geoffcox/react-splitter").then((f) => f.Split),
  { ssr: false }
);
const MainComponent = () => {
  const [size, setSize] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const layoutCSS = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <AccountsManagerProvider>
      <KeyManagerProvider>
        <ProgramsManagerProvider>
          <main>
            <div className="h-screen flex flex-col">
              {/* navbar */}
              <div className="flex-initial flex justify-between items-center border-b p-4 navbar">
                <span className="font-bold text-3xl	tracking-widest text-zinc-50 font-mono	">
                  SOLBricks
                </span>
                <span className="font-bold text-3xl	tracking-widest text-zinc-50 font-mono	">
                  <BasicModal />
                </span>
                <RunAndResetButtons sourceCode={sourceCode} />
                {/* sidebar visibility toggle */}
              </div>

              <Split initialPrimarySize="70%" onSplitChanged={setSize}>
                <BlocklyComponent
                  readOnly={false}
                  trashcan={true}
                  media={"media/"}
                  move={{
                    scrollbars: true,
                    drag: true,
                    wheel: true,
                  }}
                  onSourceChange={setSourceCode}
                  size={size}
                  toolbox={toolbox}
                />
                <div className="h-full">
                  <Tabs defaultValue="accounts" className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="accounts">Accounts</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="accounts">
                      <SideBar />
                    </TabsContent>
                    <TabsContent value="code" className="h-full">
                      <SourceCode source={sourceCode} />
                    </TabsContent>
                  </Tabs>
                </div>
              </Split>
              {/* content area */}
            </div>
          </main>
        </ProgramsManagerProvider>
      </KeyManagerProvider>
    </AccountsManagerProvider>
  );
};

export default MainComponent;
