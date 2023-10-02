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

import React, { useContext } from "react";
import "./BlocklyComponent.css";
import { useEffect, useRef } from "react";

import Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";
import { ProgramsManagerContext } from "@/services/programLoader";

Blockly.setLocale(locale);

function BlocklyComponent({ size, onSourceChange, ...props }) {
  const blocklyDiv = useRef();
  let primaryWorkspace = useRef(null);

  const programsManager = useContext(ProgramsManagerContext);
  useEffect(() => {
    console.log("programsManager.programs", programsManager.programs);
    console.log(primaryWorkspace?.current?.getRenderer().getConstants());
  }, [programsManager.programs]);
  useEffect(() => {
    /* 
      "instructions": [
    {
      "name": "setupGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playerTwo",
          "type": "publicKey"
        }
      ] */
    programsManager.programs
      .filter(
        (program) =>
          program.networkId == programsManager.networkInfo.selectedNetwork
      )
      .map((program) => {
        let blocks = program.idl.instructions.map((instruction) => {
          let args = instruction.args.map((arg) => {
            return {
              type: typeof arg.type == "string" ? arg.type : "struct",
              name: arg.name,
            };
          });
          let message =
            instruction.name + args.map((arg, id) => "\n%" + (id + 1)).join("");
          console.log(message, args);
          return {
            kind: "block",
            type: instruction.name,
            message0: message,
            previousStatement: "block",
            nextStatement: "block",
            args0: args,
          };
        });
        Blockly.defineBlocksWithJsonArray(blocks);
        let extendedToolbox = props.toolbox;
        extendedToolbox.contents = extendedToolbox.contents.concat(blocks);
        primaryWorkspace?.current?.updateToolbox(props.toolbox);
      });
  }, [
    programsManager.programs,
    programsManager.networkInfo.selectedNetwork,
    props.toolbox,
  ]);
  useEffect(() => {
    const { initialXml, children, ...rest } = props;
    if (primaryWorkspace.current === null) {
      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
        ...rest,
      });
      if (initialXml) {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          primaryWorkspace.current
        );
      }
      primaryWorkspace.current.addChangeListener(() => {
        if (Blockly.getMainWorkspace().isDragging()) {
          return; // Don't update code mid-drag.
        }
        var code = javascriptGenerator.workspaceToCode(
          primaryWorkspace.current
        );
        onSourceChange(code);
      });
    } else {
      Blockly.svgResize(primaryWorkspace.current);
    }
  }, [primaryWorkspace, blocklyDiv, props, size, onSourceChange]);

  return (
    <React.Fragment>
      <div ref={blocklyDiv} id="blocklyDiv" />
    </React.Fragment>
  );
}

//const MemoBlocklyComponent = React.memo(BlocklyComponent, ()=>true);

export default BlocklyComponent;
