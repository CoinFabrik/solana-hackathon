import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { ProgramsManagerContext } from "@/services/programLoader";
import { AccountsManagerContext } from "@/services/accountsManager";
import { KeyManagerContext } from "@/services/keysManager";

const ClearLocalStorageAndReload = () => {
  const programsManager = useContext(ProgramsManagerContext);
  const accountsManager = useContext(AccountsManagerContext);
  const keyManager = useContext(KeyManagerContext);
  const handleClearAndReload = () => {
    programsManager.clear();
    accountsManager.clear();
    keyManager.clear();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button
        onClick={handleClearAndReload}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        CLEAR ALL
      </Button>
    </div>
  );
};

export default ClearLocalStorageAndReload;
