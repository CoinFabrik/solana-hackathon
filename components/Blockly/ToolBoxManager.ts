import { ToolboxDefinition, ToolboxInfo } from "blockly/core/utils/toolbox";
import { AccountName } from "@/services/accountsManager";
import { KeypairName } from "@/services/keysManager";
import { ProgramWAddress } from "@/services/programLoader";
import Blockly, { MenuOption, Toolbox } from "blockly/core";
import javascript, { Order, javascriptGenerator } from "blockly/javascript";
import { MutableRefObject } from "react";
import { IdlEnumVariant, IdlField, IdlType, IdlTypeDef, isIdlAccounts } from "@coral-xyz/anchor/dist/cjs/idl";

const numberTypesSet = new Set([
    "u8",
    "i8",
    "u16",
    "i16",
    "u32",
    "i32",
    "f32",
    "f64"
])
const bigIntTypesSet = new Set([
    "u64",
    "i64",
    "u128",
    "i128",
    "u256",
    "i256"
])

class ToolboxManager {
    defaultToolbox: ToolboxInfo;
    accounts: Array<AccountName>;
    keypairs: Array<KeypairName>;
    programs: Array<ProgramWAddress> = [];
    enumTypes: Array<any> = [];
    structTypes: Array<any> = [];
    instructions: Array<any> = [];
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
                this.setOutput(true, "Account");
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
                (keypair)=>[keypair.name, keypair.name] as MenuOption
            )
        }
        Blockly.Blocks['input_signer'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(signerDropdownArr), "signer");
                this.setInputsInline(false);
                this.setOutput(true, "Signer");
                this.setColour(0);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        javascriptGenerator.forBlock['input_signer'] = function(block: Blockly.Block, generator: any) {
            var dropdown = block.getFieldValue('signer');
            var code = `"${dropdown}_keypair.publicKey"`;
            return [code, javascript.Order.NONE];
        };
        Blockly.Blocks['test_case'] = {
            init: function() {
              this.appendDummyInput()
                  .appendField("Test")
                  .appendField(new Blockly.FieldTextInput("#1"), "DESC");
              this.appendStatementInput("TEST_CONTENT")
                  .setCheck(null);
              this.setColour(135);
           this.setTooltip("");
           this.setHelpUrl("");
            }
          };
        javascriptGenerator.forBlock['test_case'] = function(block: Blockly.Block, generator: any) {
            var testDesc = block.getFieldValue("DESC")
            var testContent = generator.statementToCode(block, 'TEST_CONTENT');;
            console.log(testContent)
            var code = `it("${testDesc}", async() => {\n${testContent}\n}`;
            return code;
        };
    }
    generatePreamble() {
        
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
            this.instructions = [];
            programs.map((program)=>{
                console.log("program idl", program.idl)
                program.idl.instructions.map((instruction)=>{
                    let jsonDef = {
                        "type": "block_type",
                        "message0": instruction.name+"%1\nArguments:%2\n",
                        "args0": [{
                                "type": "input_dummy"
                            },{
                                "type": "input_dummy"
                            }] as any[],
                        "previousStatement": null,
                        "nextStatement": null,
                        "colour": 230,
                        "tooltip": "",
                        "helpUrl": ""
                    }
                    instruction.args.map((arg: IdlField)=>{
                        if(numberTypesSet.has(arg.type.toString())){
                            jsonDef.args0.push(
                                this.generateNumberField(arg.type.toString(), arg.name)
                            )
                        } else {
                            jsonDef.args0.push({
                                "type": "input_value",
                                "name": arg.name
                                //aca hay que hacer un check con el tipo que deberia tener
                            })
                        }
                        jsonDef.message0 += arg.name + "%" + jsonDef.args0.length;

                    });
                    jsonDef.args0.push({
                        "type": "input_dummy",
                    })
                    jsonDef.message0 += "Accounts:%"+jsonDef.args0.length+"\n"
                    instruction.accounts.map((account)=>{
                        if(!isIdlAccounts(account)){
                            
                            jsonDef.args0.push({
                                "type": "input_value",
                                "name": account.name,
                                "check": account.isSigner?"Signer":"Account"
                            })
                            jsonDef.message0 += account.name + "%" + jsonDef.args0.length;
                        }
                    });
                    console.log("jsonDef",jsonDef)
                    Blockly.Blocks['program_'+program.idl.name+'_'+instruction.name] = {
                        init: function() {
                            this.jsonInit(jsonDef);
                        }
                    };
                    javascriptGenerator.forBlock['program_'+program.idl.name+'_'+instruction.name] = function (
                        block: Blockly.Block,
                        generator: any
                      ) {
                        var args = instruction.args.map((arg)=>generator.valueToCode(block, arg.name, Order.RELATIONAL));
                        var accounts = instruction.accounts.reduce((obj,acc)=>
                            `${obj}\n${acc.name}: ${generator.valueToCode(block, acc.name, Order.RELATIONAL)},`,"" as any)
                        console.log("accounts",accounts)
                        var code = `await program_${program.idl.name}.methods.${instruction.name}${args}\n.accounts({${accounts}})`;
                        return code;
                    };
                    this.instructions.push('program_'+program.idl.name+'_'+instruction.name)
                })
            })
            this.workspaceRef.current.updateToolbox(this.generateToolbox());
        }
    }
    private generateNumberField(type: string, name: string) {
        let bits = Number(type.substring(1));
        if(type.startsWith("f")){
            return {
                "type": "field_number",
                "name": name,
                "value": 0,
            }
        } else {
            if(type.startsWith("i")) {
                let min = -(2^(bits-1));
                let max = 2^bits-1;
                return {
                    "type": "field_number",
                    "name": name,
                    "value": 0,
                    "min": min,
                    "max": max,
                    "precision": 0
                }
            } else {
                let max = 2^bits;
                return {
                    "type": "field_number",
                    "name": name,
                    "value": 0,
                    "min": 0,
                    "max": max,
                    "precision": 0
                }
            }
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
        if(this.instructions.length>0){
            let instructions = this.instructions.map((instruction,i) => {
                return {
                    kind: "block",
                    type: instruction,
                };
            })
            customContent.push({
                "kind": "category",
                "name": "Instructions",
                "colour": "#a587f7",
                "contents": instructions
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