import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload, FileCheck2 } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const claimSchema = z.object({
  saleDate: z.string().min(1, "Date of sale is required"),
  customerName: z.string().trim().min(1, "Customer name is required").max(120),
  modelNumber: z.string().trim().min(1, "Model number is required").max(80),
  serialNumber: z.string().trim().min(1, "Serial number is required").max(80),
  notes: z.string().trim().max(500).optional(),
});

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

type Product = {
  id: string;
  series: string;
  category: string | null;
  size: string | null;
  model_number: string;
  payout_rate: number | null;
};

const NewClaim = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [series, setSeries] = useState<string>("");
  const [modelNumber, setModelNumber] = useState<string>("");

  const { data: products = [] } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, series, category, size, model_number, payout_rate")
        .eq("active", true)
        .order("series")
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const seriesList = useMemo(
    () => Array.from(new Set(products.map((p) => p.series))).sort(),
    [products],
  );

  const selectedProduct = useMemo(() => {
    const m = modelNumber.trim().toLowerCase();
    if (!m) return undefined;
    return products.find(
      (p) =>
        p.model_number.toLowerCase() === m &&
        (!series || p.series === series),
    );
  }, [products, series, modelNumber]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Unsupported file type", { description: "Upload a PDF, JPG, or PNG." });
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File too large", { description: "Max size is 10 MB." });
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast.error("Proof of purchase is required");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const parsed = claimSchema.safeParse({
      saleDate: fd.get("saleDate"),
      customerName: fd.get("customerName"),
      modelNumber: modelNumber,
      serialNumber: fd.get("serialNumber"),
      notes: (fd.get("notes") as string) || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the form");
      return;
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("proof-of-purchase")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: inserted, error: insErr } = await supabase
        .from("claims")
        .insert({
          user_id: user.id,
          sale_date: parsed.data.saleDate,
          customer_name: parsed.data.customerName,
          product_id: selectedProduct?.id ?? null,
          model_number: parsed.data.modelNumber,
          serial_number: parsed.data.serialNumber,
          notes: parsed.data.notes ?? null,
          proof_path: path,
          payout_amount: selectedProduct?.payout_rate ?? 0,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      // Fire-and-forget AI validation
      if (inserted?.id) {
        supabase.functions.invoke("validate-claim", { body: { claim_id: inserted.id } }).catch(() => {});
      }

      toast.success("Claim submitted!", {
        description: "We'll review and notify you when there's an update.",
      });
      navigate("/app/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Couldn't submit claim", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Claims portal
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Submit a claim
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Log a qualified Hisense Comfort installation. We typically review
          within 3 business days.
        </p>
      </header>

      <Card className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="saleDate" className="text-xs uppercase tracking-wider">
                Date of sale
              </Label>
              <Input
                id="saleDate"
                name="saleDate"
                type="date"
                max={format(new Date(), "yyyy-MM-dd")}
                required
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-xs uppercase tracking-wider">
                Customer name
              </Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Jane Smith"
                required
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Product selection */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Product
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select your series and enter the model number from your invoice.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">
                  Step 1 · Product series
                </Label>
                <Select
                  value={series}
                  onValueChange={(v) => setSeries(v)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-card">
                    <SelectValue placeholder="Select series" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {seriesList.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelNumber" className="text-xs uppercase tracking-wider">
                  Step 2 · Model number
                </Label>
                <Input
                  id="modelNumber"
                  name="modelNumber"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="Enter model number"
                  required
                  className="h-12 rounded-xl bg-card font-mono"
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                <span className="font-mono font-semibold text-primary">
                  {selectedProduct.model_number}
                </span>
                {selectedProduct.category && (
                  <span className="text-muted-foreground">· {selectedProduct.category}</span>
                )}
                {selectedProduct.payout_rate != null && (
                  <span className="ml-auto font-semibold">
                    Payout: ${Number(selectedProduct.payout_rate).toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber" className="text-xs uppercase tracking-wider">
              Serial number
            </Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              placeholder="HSN12345678"
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything we should know about this install?"
              maxLength={500}
              className="min-h-24 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">
              Proof of purchase
            </Label>
            <label
              htmlFor="proof"
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary hover:bg-secondary/40",
                file && "border-primary bg-secondary/40",
              )}
            >
              {file ? (
                <>
                  <FileCheck2 className="h-8 w-8 text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB · click to replace
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, or PNG · up to 10 MB
                  </p>
                </>
              )}
              <input
                id="proof"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={onFile}
                className="sr-only"
              />
            </label>
          </div>

          <Button
            type="submit"
            variant="hero"
            disabled={submitting || !selectedProduct}
            className="h-14 w-full rounded-2xl text-base"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit claim"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
};

export default NewClaim;
