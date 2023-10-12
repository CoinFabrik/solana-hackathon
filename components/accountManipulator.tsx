"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import {
  AccountsManagerContext,
  AccountsManagerProvider,
} from "@/services/accountsManager";
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

const AccountManipulator = () => {
  const accountsManager = useContext(AccountsManagerContext);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");

  const handleAdd = () => {
    accountsManager?.addAccount(name, new PublicKey(address));
    setAddress("");
    setName("");
  };

  const handleRemove = (name: string) => {
    accountsManager?.removeAccount(name);
  };

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && name && isPubKeyValid(address)) {
      handleAdd();
    }
  };
  return (
    <div className="w-full max-w-md mx-auto collapsible">
      <h2 className="text-xl font-semibold mb-4 header" {...getToggleProps()}>
        {isExpanded ? "↑ Accounts" : "↓ Accounts"}
      </h2>

      <div {...getCollapseProps()}>
        <div className="flex justify-between">
          <Input
            type="text"
            id="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Input
            type="text"
            id="address"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button
            className="ml-2"
            variant="outline"
            onClick={handleAdd}
            disabled={!name || !isPubKeyValid(address)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="content">
          {accountsManager?.accounts?.length ? (
            accountsManager?.accounts.map((account, index) => (
              <div key={account.name} className="flex justify-between my-2">
                <span>{account.name}</span>
                <Button
                  variant="link"
                  onClick={() => handleRemove(account.name)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center mt-6 text-gray-600">
              Your list is empty. Add an item to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountManipulator;
