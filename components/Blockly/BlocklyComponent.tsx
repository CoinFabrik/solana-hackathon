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
import Blockly, { MenuOption } from "blockly/core";
import javascript, { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";
import { ProgramsManagerContext } from "@/services/programLoader";
import { AccountsManagerContext } from "@/services/accountsManager";
import { IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";

Blockly.setLocale(locale);

function BlocklyComponent({
  size,
  onSourceChange,
  toolbox,
  ...props
}: { size: any; onSourceChange: any; toolbox: any } & Record<string, any>) {
  const blocklyDiv: MutableRefObject<HTMLDivElement> = useRef(
    {} as HTMLDivElement
  );
  let primaryWorkspace: MutableRefObject<Blockly.WorkspaceSvg | null> =
    useRef(null);
  const currentAccounts = useRef([] as any[]);

  const currentEnumTypes = useRef([] as any[]);
  const currentStructTypes = useRef([] as any[]);

  const programsManager = useContext(ProgramsManagerContext);
  const accountsManager = useContext(AccountsManagerContext);

  useEffect(() => {
    currentAccounts.current = accountsManager?.accounts;
    const dropdownArr = () => {
      console.log("accountsManager?.accounts", currentAccounts.current);
      return currentAccounts.current.map(
        (account) => [account.name, account.address.toBase58()] as MenuOption
      );
    };

    // Account dropdown block
    if (accountsManager?.accounts && accountsManager?.accounts.length) {
      Blockly.Blocks["input_account"] = {
        init: function () {
          this.appendDummyInput().appendField(
            new Blockly.FieldDropdown(dropdownArr),
            "account"
          );
          this.setInputsInline(false);
          this.setOutput(true, "String");
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        },
      };
      javascriptGenerator.forBlock["input_account"] = function (
        block: Blockly.Block,
        generator: any
      ) {
        var dropdown_options = block.getFieldValue("account");
        // TODO: Assemble javascript into code variable.
        var code = "Account:" + dropdown_options;
        // TODO: Change ORDER_NONE to the correct strength.
        return [code, javascript.Order.NONE];
      };
    }

    // Enum dropdown blocks
    currentEnumTypes.current = [];
    programsManager?.programs.map((program) => {
      program.idl.types
        ?.filter((type: IdlTypeDef) => {
          return type.type.kind == "enum";
        })
        .map((type: any) => {
          console.log("pelq");
          currentEnumTypes.current.push([
            type.name,
            type.type.variants.map((variant: any) => {
              return variant.name;
            }),
          ]);
        });
    });
    let enums = currentEnumTypes.current.map((enumType, i) => {
      Blockly.Blocks["input_" + enumType[0]] = {
        init: function () {
          this.appendDummyInput().appendField(enumType[0]);
          this.appendDummyInput().appendField(
            new Blockly.FieldDropdown(
              currentEnumTypes.current[i][1].map((val: string, i: number) => [
                val,
                i.toString(),
              ])
            ),
            enumType[0]
          );
          this.set;
          this.setInputsInline(true);
          this.setOutput(true, "String");
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        },
      };
      javascriptGenerator.forBlock["input_" + enumType[0]] = function (
        block: Blockly.Block,
        generator: any
      ) {
        var dropdown_options = block.getFieldValue("account");
        // TODO: Assemble javascript into code variable.
        var code = "Account:" + dropdown_options;
        // TODO: Change ORDER_NONE to the correct strength.
        return [code, javascript.Order.NONE];
      };
      return {
        kind: "block",
        type: "input_" + enumType[0],
      };
    });

    // Create and set toolbox
    const { ...custom_toolbox } = toolbox;
    custom_toolbox.contents = [
      ...custom_toolbox.contents,
      {
        kind: "category",
        name: "Accounts",
        colour: "#5b67a5",
        contents: [
          {
            kind: "block",
            type: "input_account",
          },
        ],
      },
      {
        kind: "category",
        name: "Enums",
        colour: "#a587f7",
        contents: enums,
      },
    ];
    primaryWorkspace?.current?.updateToolbox(custom_toolbox);
  }, [accountsManager.accounts, programsManager.programs, toolbox]);

  useEffect(() => {
    const { initialXml, children, ...rest } = props;
    if (primaryWorkspace.current === null) {
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
    } else {
      Blockly.svgResize(primaryWorkspace.current);
    }
  }, [primaryWorkspace, blocklyDiv, props, size, onSourceChange, toolbox]);

  return (
    <React.Fragment>
      <div ref={blocklyDiv} id="blocklyDiv" />
    </React.Fragment>
  );
}

//const MemoBlocklyComponent = React.memo(BlocklyComponent, ()=>true);

export default BlocklyComponent;
