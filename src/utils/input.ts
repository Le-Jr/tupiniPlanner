export function numberInput(
  value: string,
  min: number,
  max: number,
  label: string,
  optional = false,
): number | undefined {
  if (!value.trim() && optional) return undefined;
  const n = Number(value.trim().replace(",", "."));
  if (!value.trim() || !Number.isFinite(n) || n < min || n > max)
    throw new Error(`${label}: informe um número entre ${min} e ${max}.`);
  return n;
}
export const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível salvar. Tente novamente.";
