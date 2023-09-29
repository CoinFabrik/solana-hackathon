'use client'

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { KeyManagerContext, KeyManagerProvider} from "@/services/keysManager";
import { PublicKey } from "@solana/web3.js";

const KeyManipulator = () => {
  const keyManager = useContext(KeyManagerContext);
  const [name, setName] = useState("");

  const handleAdd = () => {
    keyManager?.newKey(name);
    setName("");
  };

  const handleRemove = (name: string) => {
    keyManager?.removeKey(name);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">KeyPairs</h2>
      <div className="flex justify-between">
        <Input
          type="text"
          id="name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          className="ml-2"
          variant="outline"
          onClick={handleAdd}
          disabled={!name}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {keyManager?.keys?.length ? (
        keyManager?.keys.map((key, index) => (
          <div key={key.name} className="flex justify-between my-2">
            <span>{key.name}</span>
            <Button variant="link" onClick={() => handleRemove(key.name)}>
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
  );
};
  
export default KeyManipulator;