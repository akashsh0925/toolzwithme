import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

type Category = {
  name: string;
  units: { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
};

const categories: Category[] = [
  {
    name: "Length",
    units: [
      { id: "m", label: "Meters", toBase: (v) => v, fromBase: (v) => v },
      { id: "km", label: "Kilometers", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "cm", label: "Centimeters", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: "mm", label: "Millimeters", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "mi", label: "Miles", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: "ft", label: "Feet", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "in", label: "Inches", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: "yd", label: "Yards", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    ],
  },
  {
    name: "Weight",
    units: [
      { id: "kg", label: "Kilograms", toBase: (v) => v, fromBase: (v) => v },
      { id: "g", label: "Grams", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "mg", label: "Milligrams", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: "lb", label: "Pounds", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { id: "oz", label: "Ounces", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: "ton", label: "Metric Tons", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  {
    name: "Temperature",
    units: [
      { id: "c", label: "Celsius", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "Fahrenheit", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { id: "k", label: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    name: "Data Storage",
    units: [
      { id: "B", label: "Bytes", toBase: (v) => v, fromBase: (v) => v },
      { id: "KB", label: "Kilobytes", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: "MB", label: "Megabytes", toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
      { id: "GB", label: "Gigabytes", toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
      { id: "TB", label: "Terabytes", toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
      { id: "PB", label: "Petabytes", toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
    ],
  },
  {
    name: "Speed",
    units: [
      { id: "ms", label: "m/s", toBase: (v) => v, fromBase: (v) => v },
      { id: "kmh", label: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: "mph", label: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: "kn", label: "Knots", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    name: "Area",
    units: [
      { id: "sqm", label: "m²", toBase: (v) => v, fromBase: (v) => v },
      { id: "sqkm", label: "km²", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: "sqft", label: "ft²", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: "acre", label: "Acres", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: "ha", label: "Hectares", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
];

const UnitConverter = () => {
  const [catIndex, setCatIndex] = useState(0);
  const [fromUnit, setFromUnit] = useState(categories[0].units[0].id);
  const [toUnit, setToUnit] = useState(categories[0].units[1].id);
  const [value, setValue] = useState("1");

  const cat = categories[catIndex];

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    const from = cat.units.find((u) => u.id === fromUnit);
    const to = cat.units.find((u) => u.id === toUnit);
    if (!from || !to) return "";
    const base = from.toBase(v);
    const converted = to.fromBase(base);
    return converted.toLocaleString(undefined, { maximumFractionDigits: 10 });
  }, [value, fromUnit, toUnit, cat]);

  return (
    <ToolLayout title="Unit Converter" toolName="unit-converter">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Unit Converter</h2>
          <p className="text-sm text-muted-foreground">Convert between common units instantly.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c, i) => (
            <button
              key={c.name}
              onClick={() => { setCatIndex(i); setFromUnit(c.units[0].id); setToUnit(c.units[1]?.id || c.units[0].id); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-display transition-colors ${
                catIndex === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Converter */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">From</Label>
            <div className="flex gap-2">
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 text-lg font-mono" />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cat.units.map((u) => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => { const tmp = fromUnit; setFromUnit(toUnit); setToUnit(tmp); }}
              className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">To</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center px-3 rounded-md border border-border bg-secondary/30 text-lg font-mono text-foreground min-h-[40px]">
                {result}
              </div>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cat.units.map((u) => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default UnitConverter;
