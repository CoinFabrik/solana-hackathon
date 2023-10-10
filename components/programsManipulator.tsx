"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { ProgramsManagerContext } from "@/services/programLoader";
import { PublicKey } from "@solana/web3.js";
import { useCollapse } from "react-collapsed";

import "./collapsible.css";

function isPubKeyValid(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

const ProgramsManipulator = () => {
  const programsManager = useContext(ProgramsManagerContext);
  const [address, setAddress] = useState("");

  const handleAdd = () => {
    programsManager?.addProgram(new PublicKey(address));
    setAddress("");
  };

  const handleRemove = (pubkey: PublicKey) => {
    programsManager?.removeProgram(pubkey);
  };

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  return (
    <div className="w-full max-w-md mx-auto collapsible">
      <h2 className="text-xl font-semibold mb-4 header" {...getToggleProps()}>
        {isExpanded ? "↑ Programs" : "↓ Programs"}
      </h2>
      <div {...getCollapseProps()}>
        <div className="flex justify-between">
          <Input
            type="text"
            id="address"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button
            className="ml-2"
            variant="outline"
            onClick={handleAdd}
            disabled={!isPubKeyValid(address)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="content">
          {programsManager?.programs?.length ? (
            programsManager?.programs.map((program, index) => {
              if (
                program.networkId == programsManager.networkInfo.selectedNetwork
              )
                return (
                  <div
                    key={program.address.toString()}
                    className="flex justify-between my-2"
                  >
                    <span>{program.idl.name}</span>
                    <Button
                      variant="link"
                      onClick={() => handleRemove(program.address)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
            })
          ) : (
            <p className="text-center mt-6 text-gray-600">
              Your list is empty. Add an item to get started.
            </p>
          )}{" "}
        </div>
      </div>
    </div>
  );
};

export default ProgramsManipulator;
