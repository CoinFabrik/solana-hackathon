"use client";
import ArrayManipulator from "@/components/arrayManipulator";
import Image from "next/image";
import React, { useState, useRef, useContext, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ContractActionField from "@/components/idl_returner";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BlocklyComponent from "@/components/Blockly/BlocklyComponent";
import * as Blockly from "blockly/core";
import { workspace } from "@coral-xyz/anchor";
import { createContext } from "react";
import {
  IdlContextProvider,
  IdlDataContext,
} from "@/components/idlContextProvider";

let reactDateField = {
  type: "test_react_date_field",
  message0: "date field: %1",
  args0: [
    {
      type: "field_date",
      name: "DATE",
      date: "2020-02-20",
    },
  ],
  previousStatement: null,
  nextStatement: null,
};

Blockly.Blocks["test_react_date_field"] = {
  init: function () {
    this.jsonInit(reactDateField);
    this.setStyle("loop_blocks");
  },
};

var testReactField = {
  type: "test_react_field",
  message0: "custom field %1",
  args0: [
    {
      type: "field_react_component",
      name: "FIELD",
      text: "Click me",
    },
  ],
  previousStatement: null,
  nextStatement: null,
};

Blockly.Blocks["test_react_field"] = {
  init: function () {
    this.jsonInit(testReactField);
    this.setStyle("loop_blocks");
  },
};

var default_toolbox = {
  kind: "flyoutToolbox",
  contents: [
    {
      kind: "block",
      type: "test_react_date_field",
    },
    {
      kind: "block",
      type: "test_react_field",
    },
    {
      kind: "block",
      type: "controls_if",
    },
    {
      kind: "block",
      type: "controls_repeat_ext",
    },
    {
      kind: "block",
      type: "logic_compare",
    },
    {
      kind: "block",
      type: "math_number",
    },
    {
      kind: "block",
      type: "math_arithmetic",
    },
    {
      kind: "block",
      type: "text",
    },
    {
      kind: "block",
      type: "text_print",
    },
  ],
};

const MainComponentWithSidebar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const workspaceRef = useRef(null);
  const [idl, setIdl] = useContext(IdlDataContext);
  const [toolbox, setToolbox] = useState(default_toolbox);

  useEffect(() => {
    //console.log(idl);

    if (idl && idl.instructions) {
      const blocks = idl.instructions.map((instruction: any) => {
        //console.log(instruction);
        let block = {
          kind: "block",
          type: instruction.name,
          message0: instruction.name,
          previousStatement: null,
          nextStatement: null,
        };
        Blockly.Blocks[instruction.name] = {
          init: function () {
            this.jsonInit(block);
            this.setStyle("loop_blocks");
          },
        };

        return block;
      });

      let extendedToolbox = default_toolbox;

      extendedToolbox.contents = extendedToolbox.contents.concat(blocks);

      console.log(extendedToolbox.contents);

      setToolbox(extendedToolbox);
    }
  }, [idl]);

  const handleIncomingIdl = (result: string) => {
    const idl = JSON.parse(JSON.stringify(result, null, 2));
  };

  return (
    <main>
      <div className="h-screen flex flex-col">
        {/* navbar */}
        <div className="flex-initial flex justify-between items-center border-b p-4">
          <span className="text-lg font-bold">Navbar</span>
          {/* sidebar visibility toggle */}
          <button onClick={() => setSidebarVisible(!sidebarVisible)}>
            Toggle Sidebar
          </button>
        </div>

        {/* content area */}
        <div className="flex flex-auto">
          {/* main content area */}
          <div className="flex flex-auto flex-col">
            <ContractActionField />
            <BlocklyComponent
              readOnly={false}
              trashcan={true}
              media={"media/"}
              move={{
                scrollbars: true,
                drag: true,
                wheel: true,
              }}
              initialXml={`
              <xml xmlns="http://www.w3.org/1999/xhtml">
              <block type="controls_ifelse" x="0" y="0"></block>
              </xml>`}
              toolbox={default_toolbox}
            />
          </div>
          {/* sidebar */}
          {sidebarVisible && (
            <div>
              <Popover>
                <PopoverTrigger>Open Popover</PopoverTrigger>
                <PopoverContent>
                  Place content for the popover here.
                </PopoverContent>
              </Popover>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Accounts</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ArrayManipulator></ArrayManipulator>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MainComponentWithSidebar;
