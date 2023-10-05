/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly React Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import React, { MutableRefObject, useContext, useState } from "react";
import "./BlocklyComponent.css";
import { useEffect, useRef } from "react";
import Blockly, { MenuOption, WorkspaceSvg } from "blockly/core";
import javascript, { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";
import { ProgramsManagerContext } from "@/services/programLoader";
import { AccountsManagerContext } from "@/services/accountsManager";
import { IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
import { KeyManagerContext } from "@/services/keysManager";
import { ToolboxInfo } from "blockly/core/utils/toolbox";
import { ToolboxManager } from "./ToolBoxManager";

Blockly.setLocale(locale);

function BlocklyComponent({
  size,
  onSourceChange,
  toolbox,
  ...props
}: { size: any; onSourceChange: any; toolbox: ToolboxInfo } & Record<
  string,
  any
>) {
  const blocklyDiv: MutableRefObject<HTMLDivElement> = useRef(
    {} as HTMLDivElement
  );
  let primaryWorkspace: MutableRefObject<Blockly.WorkspaceSvg> = useRef(
    {} as WorkspaceSvg
  );
  const currentAccounts = useRef([] as any[]);

  const currentEnumTypes = useRef([] as any[]);
  const currentStructTypes = useRef([] as any[]);

  const programsManager = useContext(ProgramsManagerContext);
  const accountsManager = useContext(AccountsManagerContext);
  const keyManager = useContext(KeyManagerContext);

  const toolboxManager = useRef(
    new ToolboxManager(
      primaryWorkspace,
      toolbox,
      accountsManager.accounts,
      keyManager.keys,
      programsManager.programs
    )
  );

  useEffect(() => {

    const { initialXml, children, ...rest } = props;
    if (Object.keys(primaryWorkspace.current).length == 0) {
      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        ...rest,
      });
      if (initialXml) {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          primaryWorkspace.current
        );
      }
      primaryWorkspace.current.addChangeListener(() => {
        if (primaryWorkspace?.current?.isDragging()) {
          return; // Don't update code mid-drag.
        }
        var code = javascriptGenerator.workspaceToCode(
          primaryWorkspace.current
        );
        onSourceChange(code);
      });

      // Saving workspace state
      const state = Blockly.serialization.workspaces.save(
        primaryWorkspace.current
      );

      localStorage.setItem("PrimaryWorkspace", JSON.stringify(state));
    }
  }, [primaryWorkspace, blocklyDiv, props, onSourceChange, toolbox]);
  useEffect(() => {
    console.log("SETPROGRAMS");
    toolboxManager.current.setPrograms(programsManager.programs);
  }, [programsManager.programs, toolbox]);
  useEffect(() => {
    console.log("SETACCOUNTS");
    toolboxManager.current.setAccounts(accountsManager.accounts);
  }, [accountsManager.accounts, toolboxManager]);
  useEffect(() => {
    toolboxManager.current.setSigners(keyManager.keys);
  }, [keyManager.keys, toolboxManager]);
  useEffect(() => {
    console.log("programsManager.programs", programsManager.programs);
    console.log("BLOCKLY", Blockly, "javascriptGenerator", javascriptGenerator);
  }, [programsManager.programs]);
  useEffect(() => {
    if (Object.keys(primaryWorkspace.current).length != 0) {
      Blockly.svgResize(primaryWorkspace.current);
    }
  }, [size]);

  return (
    <React.Fragment>
      <div ref={blocklyDiv} id="blocklyDiv" />
    </React.Fragment>
  );
}

//const MemoBlocklyComponent = React.memo(BlocklyComponent, ()=>true);

export default BlocklyComponent;
