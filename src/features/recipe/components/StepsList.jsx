/** 調理手順リスト（モーダル・アコーディオン共通） */
export function StepsList({ steps, heading = "調理手順" }) {
  if (!steps?.length) return null;
  return (
    <div>
      <h3 className="font-bold text-[var(--foreground)] mb-2">{heading}</h3>
      <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
        {steps.map((step) => (
          <li key={step.step}>{step.description}</li>
        ))}
      </ol>
    </div>
  );
}
