type DataEntry = {
  UOM?: string | null;
  quantity?: number | null;
  confidence?: number | null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toUomOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const stringValue = String(value).trim();
  return stringValue.length ? stringValue : null;
};

const normalizeDataEntry = (entry: unknown): DataEntry | null => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Record<string, unknown>;
  const uom = toUomOrNull(raw.UOM ?? raw.uom);
  const quantity = toNumberOrNull(raw.quantity ?? raw.qty);
  const confidence = toNumberOrNull(raw.confidence);

  if (!uom && quantity === null) {
    return null;
  }

  return {
    UOM: uom,
    quantity,
    confidence,
  };
};

const getStatisticalFromLegacy = (
  item: Record<string, unknown>,
  preferredUom?: string | null
): { uom: string | null; qty: number | null } => {
  const statisticalQty = toNumberOrNull(item.statisticalQty);
  const statisticalUom = item.statisticalUOM;

  if (Array.isArray(statisticalUom)) {
    const entries = statisticalUom
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            UOM: toUomOrNull(entry),
            quantity: statisticalQty,
          };
        }
        return normalizeDataEntry(entry);
      })
      .filter((entry): entry is DataEntry => Boolean(entry));

    if (!entries.length) {
      return { uom: null, qty: statisticalQty };
    }

    if (preferredUom) {
      const match = entries.find(
        (entry) => (entry.UOM ?? "").toUpperCase() === preferredUom.toUpperCase()
      );
      if (match) {
        return {
          uom: toUomOrNull(match.UOM),
          qty: toNumberOrNull(match.quantity) ?? statisticalQty,
        };
      }
    }

    return {
      uom: toUomOrNull(entries[0].UOM),
      qty: toNumberOrNull(entries[0].quantity) ?? statisticalQty,
    };
  }

  if (typeof statisticalUom === "object" && statisticalUom !== null) {
    const normalized = normalizeDataEntry(statisticalUom);
    if (normalized) {
      return {
        uom: toUomOrNull(normalized.UOM),
        qty: toNumberOrNull(normalized.quantity) ?? statisticalQty,
      };
    }
  }

  return { uom: toUomOrNull(statisticalUom), qty: statisticalQty };
};

export const getCanonicalUomQty = (item: Record<string, unknown>) => {
  const rawData = item.data;
  const dataEntries = Array.isArray(rawData)
    ? rawData.map(normalizeDataEntry).filter((entry): entry is DataEntry => Boolean(entry))
    : normalizeDataEntry(rawData)
      ? [normalizeDataEntry(rawData) as DataEntry]
      : [];

  const primaryData = dataEntries[0] ?? null;
  const declaredUom = toUomOrNull(item.declaredUOM);
  const declaredQty = toNumberOrNull(item.declaredQty);
  const statistical = getStatisticalFromLegacy(item, declaredUom);

  if (
    declaredUom &&
    statistical.uom &&
    declaredUom.toUpperCase() !== statistical.uom.toUpperCase()
  ) {
    console.warn(
      "UOM conflict between declared and statistical; declared takes precedence",
      { declaredUom, statisticalUom: statistical.uom }
    );
  }
  if (
    declaredQty !== null &&
    statistical.qty !== null &&
    declaredQty !== statistical.qty
  ) {
    console.warn(
      "Quantity conflict between declared and statistical; declared takes precedence",
      { declaredQty, statisticalQty: statistical.qty }
    );
  }

  const canonicalUom =
    toUomOrNull(primaryData?.UOM) ??
    declaredUom ??
    statistical.uom ??
    "";
  const canonicalQty =
    toNumberOrNull(primaryData?.quantity) ??
    declaredQty ??
    statistical.qty ??
    0;
  const canonicalConfidence =
    toNumberOrNull(primaryData?.confidence) ??
    toNumberOrNull(item.declaredQty_confidence) ??
    toNumberOrNull(item.statisticalQty_confidence);

  const normalizedDataEntries: DataEntry[] = dataEntries.map((entry) => ({
    UOM: toUomOrNull(entry.UOM),
    quantity: toNumberOrNull(entry.quantity),
    confidence: toNumberOrNull(entry.confidence),
  }));

  if (!normalizedDataEntries.length && (canonicalUom || canonicalQty !== 0)) {
    normalizedDataEntries.push({
      UOM: canonicalUom || null,
      quantity: canonicalQty,
      confidence: canonicalConfidence,
    });
  } else if (normalizedDataEntries.length) {
    if (!normalizedDataEntries[0].UOM && canonicalUom) {
      normalizedDataEntries[0].UOM = canonicalUom;
    }
    if (normalizedDataEntries[0].quantity === null && canonicalQty !== null) {
      normalizedDataEntries[0].quantity = canonicalQty;
    }
    if (
      normalizedDataEntries[0].confidence === null &&
      canonicalConfidence !== null
    ) {
      normalizedDataEntries[0].confidence = canonicalConfidence;
    }
  }

  return {
    uom: canonicalUom,
    qty: canonicalQty,
    confidence: canonicalConfidence,
    dataEntries: normalizedDataEntries,
  };
};

export const withLegacyCompatibility = <T extends Record<string, unknown>>(
  item: T
): T & {
  data: DataEntry[] | null;
  declaredUOM: string;
  declaredQty: number;
  statisticalUOM: string;
  statisticalQty: number;
} => {
  const canonical = getCanonicalUomQty(item);

  return {
    ...item,
    data: canonical.dataEntries.length ? canonical.dataEntries : null,
    declaredUOM: canonical.uom,
    declaredQty: canonical.qty,
    statisticalUOM: canonical.uom,
    statisticalQty: canonical.qty,
  };
};

export const withCanonicalFromUiValues = <T extends Record<string, unknown>>(
  item: T,
  uomValue: unknown,
  qtyValue: unknown,
  confidenceValue?: unknown
) => {
  const canonicalUom = toUomOrNull(uomValue);
  const canonicalQty = toNumberOrNull(qtyValue);
  const canonicalConfidence = toNumberOrNull(confidenceValue);

  if (canonicalUom === null && canonicalQty === null) {
    return withLegacyCompatibility(item);
  }

  const rawExistingData = item["data"];
  const existingDataEntries = Array.isArray(rawExistingData)
    ? rawExistingData
    : rawExistingData !== null && rawExistingData !== undefined
      ? [rawExistingData]
      : [];
  const normalizedExistingData = existingDataEntries
    .map(normalizeDataEntry)
    .filter((entry): entry is DataEntry => Boolean(entry));

  if (normalizedExistingData.length) {
    const firstEntry = normalizedExistingData[0];
    normalizedExistingData[0] = {
      UOM: canonicalUom ?? firstEntry.UOM ?? null,
      quantity: canonicalQty ?? firstEntry.quantity ?? null,
      confidence: canonicalConfidence ?? firstEntry.confidence ?? null,
    };

    return withLegacyCompatibility({
      ...item,
      data: normalizedExistingData,
    });
  }

  const seeded = {
    ...item,
    data: [
      {
        UOM: canonicalUom,
        quantity: canonicalQty,
        ...(canonicalConfidence !== null ? { confidence: canonicalConfidence } : {}),
      },
    ],
  };

  return withLegacyCompatibility(seeded);
};
