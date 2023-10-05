import { ToolboxDefinition, ToolboxInfo } from "blockly/core/utils/toolbox";
import { AccountName } from "@/services/accountsManager";
import { KeypairName } from "@/services/keysManager";
import { ProgramWAddress } from "@/services/programLoader";
import Blockly, { MenuOption, Toolbox } from "blockly/core";
import javascript, { javascriptGenerator } from "blockly/javascript";
import { MutableRefObject } from "react";
import { IdlEnumVariant, IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
class ToolboxManager {
    defaultToolbox: ToolboxInfo;
    accounts: Array<AccountName>;
    keypairs: Array<KeypairName>;
    programs: Array<ProgramWAddress> = [];
    enumTypes: Array<any> = [];
    structTypes: Array<any> = [];
    workspaceRef: MutableRefObject<Blockly.WorkspaceSvg>;
    constructor(
        workspaceRef: MutableRefObject<Blockly.WorkspaceSvg>,
        defaultToolbox: ToolboxInfo, 
        accounts: Array<AccountName>,
        keypairs: Array<KeypairName>,
        programs: Array<ProgramWAddress>
    ) {
        this.workspaceRef = workspaceRef;
        this.defaultToolbox = { ...defaultToolbox };
        this.accounts = [...accounts];
        this.keypairs = [...keypairs];
        this.programs = [...programs];

        const accountsDropdownArr = ()=>{
            return this.accounts.map(
                (account)=>[account.name, account.address.toBase58()] as MenuOption
            )
        }
        Blockly.Blocks['input_account'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(accountsDropdownArr), "account");
                this.setInputsInline(false);
                this.setOutput(true, "String");
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        javascriptGenerator.forBlock['input_account'] = function(block: Blockly.Block, generator: any) {
            var dropdown_options = block.getFieldValue('account');
            var code = `"${dropdown_options}"`;
            return [code, javascript.Order.NONE];
        };
        const signerDropdownArr = ()=>{
            console.log("this.keypairs", this.keypairs)
            return this.keypairs.map(
                (keypair)=>[keypair.name, keypair.keypair.publicKey.toBase58()] as MenuOption
            )
        }
        Blockly.Blocks['input_signer'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(signerDropdownArr), "signer");
                this.setInputsInline(false);
                this.setOutput(true, "String");
                this.setColour(0);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        javascriptGenerator.forBlock['input_signer'] = function(block: Blockly.Block, generator: any) {
            var dropdown_options = block.getFieldValue('signer');
            var code = `"${dropdown_options}"`;
            return [code, javascript.Order.NONE];
        };
    }

    setSigners(signers: Array<KeypairName>) {
        this.keypairs = [...signers];
        if(this.keypairs.length){
            this.workspaceRef.current.updateToolbox(this.generateToolbox());
        }
    }
    setAccounts(accounts: Array<AccountName>) {
        this.accounts = [...accounts];
        if(this.accounts.length){
            this.workspaceRef.current.updateToolbox(this.generateToolbox());
        }
    }
    setPrograms(programs: Array<ProgramWAddress>) {
        this.programs = [...programs];
        this.enumTypes = [];
        if(this.programs.length){
            programs.map((program) => {
                program.idl.types
                  ?.filter((type: IdlTypeDef) => {
                    return type.type.kind == "enum";
                  })
                  .map((type: any) => {
                    this.enumTypes.push([
                      type.name,
                      type.type.variants.map((variant: IdlEnumVariant) => {
                        return variant.name;
                      }),
                    ]);
                });
            });
            let enumtypes = this.enumTypes;
            this.enumTypes.map((enumType, i) => {
                console.log(this.enumTypes, enumType, i)
                Blockly.Blocks["input_" + enumType[0]] = {
                  init: function () {
                    this.appendDummyInput()
                      .appendField(enumType[0])
                      .appendField(
                      new Blockly.FieldDropdown(()=>{
                            return enumtypes[i][1].map((val: string, i: number) => [
                                val,
                                i.toString(),
                            ]);
                        }
                      ),
                      "enum_value"
                    );
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
                  var dropdown_options = block.getFieldValue("enum_value");
                  // TODO: Assemble javascript into code variable.
                  var code = enumType[0] + "_enum_value:" + dropdown_options;
                  // TODO: Change ORDER_NONE to the correct strength.
                  return [code, javascript.Order.NONE];
                };
            });
            this.workspaceRef.current.updateToolbox(this.generateToolbox());
        }
    }
    private generateToolbox(): ToolboxDefinition {
        console.log("this.defaultToolbox", this.defaultToolbox);
        let customContent = [];
        if(this.accounts.length>0){
            customContent.push({
                "kind": "category",
                "name": "Accounts",
                "id": "ACCOUNTS",
                "colour": "#5b67a5",
                "contents": [
                    {
                        "kind": "block",
                        "type": "input_account"
                    }
                ]
            });
        }
        if(this.keypairs.length>0){
            customContent.push({
                "kind": "category",
                "name": "Signers",
                "id": "SIGNERS",
                "colour": "#5b67a5",
                "contents": [
                    {
                        "kind": "block",
                        "type": "input_signer"
                    }
                ]
            });
        }
        if(this.enumTypes.length>0){
            let enums = this.enumTypes.map((enumType,i) => {
                return {
                    kind: "block",
                    type: "input_" + enumType[0],
                };
            })
            customContent.push({
                "kind": "category",
                "name": "Enums",
                "colour": "#a587f7",
                "contents": enums
            })
        }
        let currentToolbox = { 
            ...this.defaultToolbox,
            contents: [
                ...this.defaultToolbox.contents,
                ...customContent
            ]
        };
        return currentToolbox;
    }
}
export {ToolboxManager}