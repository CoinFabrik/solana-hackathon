import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import VirtualWallet from "./wallet";
import { IdlContextProvider, IdlDataContext } from "@/components/idlContextProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const ContractActionField = (props: any) => {
  const [network, setNetwork] = useState("localhost");
  const [contractAddress, setContractAddress] = useState("");
  const [idl, setIdl] = useContext(IdlDataContext);

  const executeFunction = async () => {
    let con;

    if (network == "localhost") {
      con = "http://localhost:8899";
    } else {
      con = "https://api.devnet.solana.com";
    }

    const anconn = new anchor.AnchorProvider(
      new web3.Connection(con),
      new VirtualWallet(web3.Keypair.generate()),
      anchor.AnchorProvider.defaultOptions()
    );

    const idl = await anchor.Program.fetchIdl(contractAddress, anconn);
    if(setIdl){
      setIdl(idl);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid gap-4">
        <Input
          className="w-full"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="w-full p-2 bg-blue-500 text-white rounded-md">
            Select network: {network}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onSelect={() => setNetwork("localhost")}>
              localhost
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setNetwork("devnet")}>
              devnet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="w-full" onClick={executeFunction}>
          Execute Function
        </Button>
      </div>
    </div>
  );
};

export default ContractActionField;
