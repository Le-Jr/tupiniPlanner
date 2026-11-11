import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
export async function shareBackup(content: string): Promise<void> {
  const name = `tupiniplanner-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Compartilhamento indisponível neste aparelho.");
  const file = new File(Paths.cache, name);
  file.write(content);
  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Salvar backup TupiniPlanner",
      UTI: "public.json",
    });
  } finally {
    if (file.exists) file.delete();
  }
}
export async function pickBackup(): Promise<string | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return;
  const asset = result.assets[0]!;
  if (asset.size !== undefined && asset.size > 20_000_000)
    throw new Error("Backup excede 20 MB.");
  if (Platform.OS === "web") {
    if (asset.file) return await asset.file.text();
    throw new Error("Não foi possível ler o arquivo no navegador.");
  }
  const file = new File(asset.uri);
  try {
    return await file.text();
  } finally {
    if (file.exists) file.delete();
  }
}
