'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

const ArrayManipulator = () => {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    setList([...list, input]);
    setInput("");
  };

  const handleRemove = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Array Manipulator</h2>
      <div className="flex justify-between">
        <Input
          type="text"
          id="item"
          placeholder="Enter item"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          className="ml-2"
          variant="outline"
          onClick={handleAdd}
          disabled={!input}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {list.length ? (
        list.map((item, index) => (
          <div key={index} className="flex justify-between my-2">
            <span>{item}</span>
            <Button variant="link" onClick={() => handleRemove(index)}>
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
  
export default ArrayManipulator;