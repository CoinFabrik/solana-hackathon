"use client";

import React, { useContext, useState } from "react";
import AccountManipulator from "@/components/accountManipulator";
import KeyManipulator from "@/components/keyManipulator";
import ProgramsManipulator from "./programsManipulator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgramsManagerContext } from "@/services/programLoader";

import "./collapsible.css";
const SideBar = () => {
  const programsManager = useContext(ProgramsManagerContext);

  const handleChange = (id: number) => {
    programsManager?.selectNetwork(id);
  };
  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="grid gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full p-2 networkSelector text-white rounded-md ">
              Select network:{" "}
              {
                programsManager?.networkInfo.networks[
                  programsManager?.networkInfo.selectedNetwork
                ].name
              }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {programsManager?.networkInfo.networks.map((network, id) => (
                <DropdownMenuItem key={id} onSelect={() => handleChange(id)}>
                  {network.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AccountManipulator />
      <KeyManipulator />
      <ProgramsManipulator />
    </>
  );
};

export default SideBar;
