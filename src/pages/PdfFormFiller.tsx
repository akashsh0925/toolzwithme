import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, CheckCircle, FormInput } from "lucide-react";
import { toast } from "sonner";

interface FormField {
  name: string;
  type: string;
  value: string;
  options?: string[];
}

const PdfFormFiller = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please select a PDF"); return; }
    setFile(f);
    setResult(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = doc.getForm();
      const pdfFields = form.getFields();

      const detected: FormField[] = pdfFields.map((field) => {
        const name = field.getName();
        const type = field.constructor.name;

        let value = "";
        try {
          if (type === "PDFTextField") {
            value = (field as any).getText() || "";
          } else if (type === "PDFCheckBox") {
            value = (field as any).isChecked() ? "true" : "false";
          } else if (type === "PDFDropdown") {
            const selected = (field as any).getSelected();
            value = selected?.[0] || "";
          }
        } catch {}

        let options: string[] | undefined;
        try {
          if (type === "PDFDropdown") {
            options = (field as any).getOptions();
          }
        } catch {}

        return { name, type, value, options };
      });

      setFields(detected);
      if (detected.length === 0) {
        toast.info("No fillable form fields detected in this PDF");
      } else {
        toast.success(`Found ${detected.length} form field(s)`);
      }
    } catch (e: any) {
      toast.error("Failed to read form fields: " + e.message);
    }
  }, []);

  const updateField = (index: number, value: string) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)));
  };

  const fillAndSave = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = doc.getForm();

      fields.forEach((f) => {
        try {
          if (f.type === "PDFTextField") {
            form.getTextField(f.name).setText(f.value);
          } else if (f.type === "PDFCheckBox") {
            const cb = form.getCheckBox(f.name);
            f.value === "true" ? cb.check() : cb.uncheck();
          } else if (f.type === "PDFDropdown") {
            form.getDropdown(f.name).select(f.value);
          }
        } catch {}
      });

      // Flatten to make it non-editable
      form.flatten();
      setResult(new Uint8Array(await doc.save()));
      toast.success("Form filled and saved!");
    } catch (e: any) {
      toast.error(e.message);
    }
    setProcessing(false);
  }, [file, fields]);

  const downloadResult = useCallback(() => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".pdf", "_filled.pdf");
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  return (
    <ToolLayout title="PDF Form Filler" toolName="pdf-form-filler">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Form Filler</h2>
          <p className="text-sm text-muted-foreground">Detect and fill interactive form fields in PDFs.</p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("pdf-form-input")?.click()}
        >
          <input id="pdf-form-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <p className="text-sm text-foreground font-medium">{file.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop a fillable PDF here</p>
          )}
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold text-foreground">
              <FormInput className="w-4 h-4 inline mr-1.5" />
              {fields.length} Form Field(s)
            </h3>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.name} className="p-3 rounded-lg border border-border bg-card space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground">{field.name}</Label>
                  {field.type === "PDFCheckBox" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value === "true"}
                        onCheckedChange={(checked) => updateField(i, checked ? "true" : "false")}
                      />
                      <span className="text-sm text-foreground">{field.value === "true" ? "Checked" : "Unchecked"}</span>
                    </div>
                  ) : field.type === "PDFDropdown" && field.options ? (
                    <select
                      value={field.value}
                      onChange={(e) => updateField(i, e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select…</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={field.value}
                      onChange={(e) => updateField(i, e.target.value)}
                      placeholder={`Enter ${field.name}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Button onClick={fillAndSave} disabled={processing} className="w-full">
              {processing ? "Saving…" : "Fill & Save PDF"}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Filled PDF ready!</p>
            </div>
            <Button size="sm" onClick={downloadResult}>
              <Download className="w-4 h-4 mr-1.5" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfFormFiller;
