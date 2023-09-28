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

import React from "react";
import "./BlocklyComponent.css";
import { useEffect, useRef } from "react";

import Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";

Blockly.setLocale(locale);

function BlocklyComponent(props: any) {
  const blocklyDiv = useRef(null as any);
  let primaryWorkspace = useRef(null as any);

  const generateCode = () => {
    var code = javascriptGenerator.workspaceToCode(primaryWorkspace.current);
    console.log(code);
  };

  useEffect(() => {
    const { initialXml, children, ...rest } = props;
    if (primaryWorkspace.current === null) {
      console.log("primaryWorkspace.current === null")
      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
        ...rest,
      });

      if (initialXml) {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          primaryWorkspace.current
        );
      }
    }
    console.log("render")
    if(props.toolbox) { 
      console.log(props.toolbox)
      primaryWorkspace.current.updateToolbox(props.toolbox)
    }
  }, [primaryWorkspace, blocklyDiv, props]);

  return (
    <React.Fragment>
      <div ref={blocklyDiv} id="blocklyDiv" />
    </React.Fragment>
  );
}

export default BlocklyComponent;
