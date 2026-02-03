import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Trash2, Plus, Info } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const TRANSFORMATION_INFO: Record<string, { desc: string; usage: string; output: string }> = {
  format_description: {
    desc: "Standardizes description fields (Desc 1, 2, 3) using K1/Freight specific formatting logic.",
    usage: "Select 'Format Descriptions' to automatically consolidate and format item descriptions.",
    output: "'10 CTN / 60 BTLS - Item Name (12%)'"
  },
  item_type: {
    desc: "Applies specialized logic to calculate Declared Quantity and UOM (e.g., for alcohol VPL).",
    usage: "Select 'Modify Declared Values' to apply special quantity extraction rules.",
    output: "Declared Qty uses VPL value, UOM set to 'VPL' or 'LTR'."
  },
  hscode: {
    desc: "Applies specific logic to determine HS Codes based on item names (e.g., distinguishing Sake vs Wine).",
    usage: "Select 'Modify hscode' to apply auto-classification rules for specific items.",
    output: "HS Code set to 2206.00.2000 for Sake, 2204.21.1100 for Wine."
  },
  set_fixed: {
    desc: "Sets a specific field to a fixed value for all items (or conditionally).",
    usage: "Select 'Set Fixed Value', target 'Country', value 'USA'.",
    output: "Country: 'USA' (for all rows)"
  },
  append: {
    desc: "Adds text to the end of an existing field's value.",
    usage: "Select 'Append', target 'Weight', value ' kg'.",
    output: "Weight: '100 kg'"
  },
  prepend: {
    desc: "Adds text to the beginning of an existing field's value.",
    usage: "Select 'Prepend', target 'Ref', value 'ID-'.",
    output: "Ref: 'ID-123'"
  },
  replace: {
    desc: "Finds and replaces specific text within a field.",
    usage: "Select 'Search & Replace', target 'Address', find 'St', replace 'Street'.",
    output: "Address: '123 Main Street'"
  },
  math_operation: {
    desc: "Performs arithmetic calculations between fields.",
    usage: "Select 'Math Operation', expression 'Price * Qty'.",
    output: "Total: 50.00"
  },
  conditional_logic: {
    desc: "Applies a value only when a specific condition is met.",
    usage: "If 'Status' equals 'Pending', set 'Priority' to 'High'.",
    output: "Priority: 'High' (only for matching rows)"
  },
  split_output: {
    desc: "Moves items that match a condition into a separate output file.",
    usage: "Split if 'HS Code' equals '1234', suffix 'Special'.",
    output: "Creates a main file and a second '..._Special' file with matched items."
  }
};

function TransformationHelp({ type }: { type: string }) {
  const [show, setShow] = useState(false);
  const info = TRANSFORMATION_INFO[type];
  
  if (!info) return null;

  return (
    <div className="relative inline-block ml-1">
      <Info 
        className="w-4 h-4 text-muted-foreground cursor-help hover:text-blue-500 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 w-80 p-3 mt-2 -left-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md border shadow-xl text-xs space-y-2">
            <div><span className="font-semibold text-blue-600 dark:text-blue-400">Description:</span> {info.desc}</div>
            <div><span className="font-semibold text-blue-600 dark:text-blue-400">Usage:</span> {info.usage}</div>
            <div><span className="font-semibold text-blue-600 dark:text-blue-400">Output:</span> {info.output}</div>
        </div>
      )}
    </div>
  );
}

// reng: add trans type
// anal: transfs type
export interface Transformation {
  id: string;
  type: "set_fixed" | "math_operation" | "conditional_logic" | "append" | "prepend" | "replace" | 'format_description' | 'item_type' | 'custom_instructions' | 'split_output';
  target_field: string;
  value?: string;
  expression?: string;
  condition?: string;
  condition_field?: string;
  condition_operator?: "equals" | "contains" | "not_equals" | "greater_than" | "less_than" | "starts_with";
  condition_value?: string;
  true_value?: string;
  false_value?: string;
  search_value?: string;
  replace_value?: string;
  // Split output specific fields
  split_field?: string;
  split_operator?: "equals" | "contains" | "not_equals" | "greater_than" | "less_than" | "starts_with";
  split_value?: string;
  output_suffix?: string;
}

export interface CompanyCustomization {
  id: string;
  sub_company_name: string;
  custom_prompt: string;
  transformations: Transformation[];
}

interface CustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: CompanyCustomization | null;
  onSave: (customization: CompanyCustomization) => void;
}

export function CustomizationModal({
  open,
  onOpenChange,
  customization: initialCustomization,
  onSave,
}: CustomizationModalProps) {
  const [subCompanyName, setSubCompanyName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [transformations, setTransformations] = useState<Transformation[]>([]);

  useEffect(() => {
    if (initialCustomization) {
      setSubCompanyName(initialCustomization.sub_company_name || "");
      setCustomPrompt(initialCustomization.custom_prompt || "");
      setTransformations(initialCustomization.transformations || []);
    } else {
      setSubCompanyName("");
      setCustomPrompt("");
      setTransformations([]);
    }
  }, [initialCustomization, open]);

  const addTransformation = () => {
    const newTransformation: Transformation = {
      id: Math.random().toString(36).substring(7),
      // anal: default dropdown
      type: "item_type",
      target_field: "",
      value: "",
    };
    setTransformations([...transformations, newTransformation]);
  };

  const removeTransformation = (id: string) => {
    setTransformations(transformations.filter((t) => t.id !== id));
  };

  const updateTransformation = (id: string, updates: Partial<Transformation>) => {
    setTransformations(
      transformations.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleSave = () => {
    onSave({
      id: initialCustomization?.id || Math.random().toString(36).substring(7),
      sub_company_name: subCompanyName,
      custom_prompt: customPrompt,
      transformations: transformations,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialCustomization ? "Edit Customization" : "Add Customization"}
          </DialogTitle>
          <DialogDescription>
            Define rules and custom prompts for a specific sub-company or client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4 border p-4 rounded-lg bg-slate-50">
            <div className="space-y-2">
              <Label htmlFor="sub_company_name">Sub-Company/Client Name</Label>
              <Input
                id="sub_company_name"
                placeholder="e.g., Apple Inc. or Global Logistics"
                value={subCompanyName}
                onChange={(e) => setSubCompanyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If the document matches this name (Consignee/Shipper), these rules will apply.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_prompt">Custom AI Prompt Instructions</Label>
              <Textarea
                id="custom_prompt"
                placeholder="e.g., Always use the vendor name from the header as the primary entity. If weight is in LBS, convert to KG."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Additional instructions for the AI when processing documents for this sub-company.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Transformations</Label>
            {transformations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No transformations defined for this sub-company.
              </div>
            ) : (
              transformations.map((t) => (
                <Card key={t.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-destructive hover:text-destructive/90"
                    onClick={() => removeTransformation(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardContent className="pt-6 grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                            <Label className="flex items-center gap-1">Type <TransformationHelp type={t.type} /></Label>
                        <Select
                          value={t.type}
                          onValueChange={(value: any) =>
                            updateTransformation(t.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          {/* anal: dropdown */}
                        <SelectContent>
                          <SelectItem value="format_description">Format Descriptions</SelectItem>
                          <SelectItem value="item_type">Modify Declared Values</SelectItem>
                          <SelectItem value="hscode">Modify hscode</SelectItem>

                          <SelectItem value="set_fixed">Set Fixed Value</SelectItem>
                            <SelectItem value="append">Append text</SelectItem>
                            <SelectItem value="prepend">Prepend text</SelectItem>
                            <SelectItem value="replace">Search & Replace</SelectItem>
                            <SelectItem value="math_operation">
                              Math Operation
                            </SelectItem>
                            <SelectItem value="conditional_logic">
                              Conditional Logic
                            </SelectItem>
                            <SelectItem value="split_output">
                              <span className="flex items-center gap-2">Split Output Files</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>                  
                      <div className="space-y-2">
                        <Label>Target Column</Label>
                        <Input
                          placeholder="if applicable. e.g., HSCode"
                          value={t.target_field}
                          onChange={(e) =>
                            updateTransformation(t.id, {
                              target_field: e.target.value,
                            })
                          }
                        />
                      </div>

                    </div>

                  {/* anal: only changed ui */}

                    {t.type === "item_type" && (
                      <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Modify values in declared columns should the item be a Sake.
              </p>

                      </div>
                    )}


                    {t.type === "set_fixed" && (
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          placeholder="e.g., 1000"
                          value={t.value || ""}
                          onChange={(e) =>
                            updateTransformation(t.id, { value: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {(t.type === "append" || t.type === "prepend") && (
                      <div className="space-y-2">
                        <Label>Text to {t.type}</Label>
                        <Input
                          placeholder={t.type === "append" ? "e.g., (Revised)" : "e.g., URGENT: "}
                          value={t.value || ""}
                          onChange={(e) =>
                            updateTransformation(t.id, { value: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {t.type === "replace" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Find</Label>
                          <Input
                            placeholder="Text to find"
                            value={t.search_value || ""}
                            onChange={(e) =>
                              updateTransformation(t.id, { search_value: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Replace with</Label>
                          <Input
                            placeholder="Replacement text"
                            value={t.replace_value || ""}
                            onChange={(e) =>
                              updateTransformation(t.id, { replace_value: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {t.type === "math_operation" && (
                      <div className="space-y-2">
                        <Label>Expression</Label>
                        <Input
                          placeholder="e.g., Quantity * UnitPrice"
                          value={t.expression || ""}
                          onChange={(e) =>
                            updateTransformation(t.id, {
                              expression: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {t.type === "conditional_logic" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>If Field</Label>
                            <Input
                              placeholder="e.g., Country"
                              value={t.condition_field || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  condition_field: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Operator</Label>
                            <Select
                              value={t.condition_operator || "equals"}
                              onValueChange={(value: any) =>
                                updateTransformation(t.id, {
                                  condition_operator: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals (==)</SelectItem>
                                <SelectItem value="not_equals">Not Equals (!=)</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="starts_with">Starts With</SelectItem>
                                <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                                <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              placeholder="e.g., CN"
                              value={t.condition_value || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  condition_value: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>True Value</Label>
                            <Input
                              placeholder="Value if true"
                              value={t.true_value || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  true_value: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>False Value</Label>
                            <Input
                              placeholder="Value if false"
                              value={t.false_value || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  false_value: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {t.type === "split_output" && (
                      <div className="space-y-4 border-l-4 border-blue-400 pl-4 bg-blue-50/50 py-3 rounded-r">
                        <p className="text-xs text-blue-700 font-medium">
                          📁 Records matching this condition will be split into a separate output file.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Split by Field</Label>
                            <Input
                              placeholder="e.g., hsCode"
                              value={t.split_field || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  split_field: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Condition</Label>
                            <Select
                              value={t.split_operator || "equals"}
                              onValueChange={(value: any) =>
                                updateTransformation(t.id, {
                                  split_operator: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals (==)</SelectItem>
                                <SelectItem value="not_equals">Not Equals (!=)</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="starts_with">Starts With</SelectItem>
                                <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                                <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              placeholder="e.g., 1111"
                              value={t.split_value || ""}
                              onChange={(e) =>
                                updateTransformation(t.id, {
                                  split_value: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Output File Suffix</Label>
                          <Input
                            placeholder="e.g., hs_1111 (will create file_hs_1111.xlsx)"
                            value={t.output_suffix || ""}
                            onChange={(e) =>
                              updateTransformation(t.id, {
                                output_suffix: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            The main file will contain all non-matching records.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addTransformation}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Transformation Rule
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!subCompanyName}>
            Save Customization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

