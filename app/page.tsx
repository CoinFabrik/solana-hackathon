"use client";
import AccountManipulator from "@/components/accountManipulator";
import Image from "next/image";
import React, { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
import { Split } from "@geoffcox/react-splitter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SourceCode from "@/components/SourceCodeViewer/sourceCode";
import SideBar from "@/components/sideBar";
import { AccountsManagerProvider } from "@/services/accountsManager";
import { KeyManagerProvider } from "@/services/keysManager";
import { ProgramsManagerProvider } from "@/services/programLoader";

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

var pubKeyBlock = {
  type: "publicKey",
  message0: "public key %1",
  args0: [
    {
      type: "field_variable",
      name: "PublicKey",
      text: "...",
    },
  ],
  previousStatement: null,
  nextStatement: null,
};

Blockly.Blocks["pubKeyBlock"] = {
  init: function () {
    this.jsonInit(pubKeyBlock);
    this.setStyle("loop_blocks");
  },
};

var setupGame = {
  type: "setupGame",
  message0: "Setup Game %1",
  args0: [
    {
      type: "field_value",
      name: "PublicKey",
      text: "...",
    },
  ],
  previousStatement: null,
  nextStatement: null,
};

Blockly.Blocks["setupGame"] = {
  init: function () {
    this.jsonInit(setupGame);
    this.setStyle("procedure_blocks");
  },
};

const toolbox = {
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
      type: "setupGame",
    },

    {
      kind: "block",
      type: "text",
    },
  ],
};

const MainComponent = () => {
  const [size, setSize] = useState("70%");
  const [sourceCode, setSourceCode] = useState("");
  return (
    <AccountsManagerProvider>
      <KeyManagerProvider>
        <ProgramsManagerProvider>
          <main>
            <div className="h-screen flex flex-col">
              {/* navbar */}
              <div className="flex-initial flex justify-between items-center border-b p-4">
                <span className="text-lg font-bold">Navbar</span>
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
                  initialXml={`
              <xml xmlns="http://www.w3.org/1999/xhtml">
              <block type="controls_ifelse" x="0" y="0"></block>
              </xml>`}
                  toolbox={toolbox}
                />
                <div>
                  <Tabs defaultValue="accounts">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="accounts">Accounts</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="accounts">
                      <SideBar />
                    </TabsContent>
                    <TabsContent value="code">
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
