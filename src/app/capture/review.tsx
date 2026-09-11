import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { FormField } from "@/components/form-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { UiButton } from "@/components/ui-button";
import { Spacing } from "@/constants/theme";
import { runProductCheck } from "@/lib/check-flow";
import {
  extraPhotoCount,
  hasFrontPhoto,
  visiblePhotos,
  type EditableDraftKey,
} from "@/lib/draft";
import { useDraft } from "@/lib/draft-context";
import { useSession } from "@/lib/session";

export default function CaptureReviewScreen() {
  const router = useRouter();
  const { isComplete } = useSession();
  const { draft, persist, canLeaveCamera } = useDraft();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [checkBusy, setCheckBusy] = useState(false);

  if (!canLeaveCamera) {
    return (
      <ThemedView
        style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}
      >
        <ThemedText>A front photo is required before Review.</ThemedText>
        <UiButton label="Back to camera" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  function patchField(key: EditableDraftKey, value: string) {
    const userEditedFields = draft.userEditedFields.includes(key)
      ? draft.userEditedFields
      : [...draft.userEditedFields, key];
    void persist({ ...draft, [key]: value, userEditedFields });
  }

  async function onCheck() {
    if (checkBusy) {
      return;
    }
    setCheckBusy(true);
    setPrompt(null);
    try {
      const result = await runProductCheck(draft);
      await persist(result.merged);
      const note = result.warnings.filter(Boolean).join(" ");
      setPrompt(note || "Label read. Edited fields were kept.");
    } catch (caught) {
      setPrompt(caught instanceof Error ? caught.message : "Check failed.");
    } finally {
      setCheckBusy(false);
    }
  }

  function onSubmit() {
    if (!isComplete) {
      setPrompt("Set a username and store PIN in Settings before Submit.");
      return;
    }
    if (!hasFrontPhoto(draft)) {
      setPrompt("Take a front photo before Submit.");
      return;
    }
    setPrompt(
      "Submit to Firestore lands in a later phase. This draft is saved on the device.",
    );
  }

  const sourcePhotos = visiblePhotos(draft);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: Spacing.four }}
      >
        <View style={{ gap: Spacing.three }}>
          <ThemedText type="small" themeColor="textSecondary">
            {draft.photos.length} photo{draft.photos.length === 1 ? "" : "s"} in
            this draft
            {extraPhotoCount(draft) > 0
              ? `, including ${extraPhotoCount(draft)} extra`
              : ""}
            . Tap a photo to open it full-size and confirm it. Use Zoom and crop
            if the label is small.
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: Spacing.two }}>
              {sourcePhotos.map((photo) => (
                <Pressable
                  key={photo.id}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${photo.purpose} photo`}
                  onPress={() =>
                    router.push(
                      `/capture/preview?photoId=${encodeURIComponent(photo.id)}`,
                    )
                  }
                >
                  <Image
                    source={{ uri: photo.uri }}
                    recyclingKey={`${photo.id}-${photo.uri}`}
                    cachePolicy="none"
                    contentFit="cover"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 8,
                      backgroundColor: "#222",
                    }}
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    {photo.purpose}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <UiButton
            label="Zoom and crop"
            onPress={() =>
              router.push(
                `/capture/crop?photoId=${encodeURIComponent(sourcePhotos.at(-1)?.id ?? sourcePhotos[0]?.id ?? "")}`,
              )
            }
          />
          <FormField
            label="Product name"
            value={draft.product_name}
            onChangeText={(value) => patchField("product_name", value)}
            autoCapitalize="sentences"
          />
          <FormField
            label="Category"
            value={draft.product_category}
            onChangeText={(value) => patchField("product_category", value)}
            autoCapitalize="sentences"
          />
          <FormField
            label="Sub-category"
            value={draft.product_sub_category}
            onChangeText={(value) => patchField("product_sub_category", value)}
            autoCapitalize="sentences"
          />
          <FormField
            label="Size / pack"
            value={draft.standard_size}
            onChangeText={(value) => patchField("standard_size", value)}
          />
          <FormField
            label="Barcode / item id"
            value={draft.product_item_id}
            onChangeText={(value) => patchField("product_item_id", value)}
            keyboardType="number-pad"
          />
          <FormField
            label="MRP"
            value={draft.mrp}
            onChangeText={(value) => patchField("mrp", value)}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Manufactured (YYYY-MM-DD)"
            value={draft.mfd}
            onChangeText={(value) => patchField("mfd", value)}
          />
          <FormField
            label="Expiry (YYYY-MM-DD)"
            value={draft.expiry_date}
            onChangeText={(value) => patchField("expiry_date", value)}
          />
          <FormField
            label="Quantity"
            value={draft.quantity}
            onChangeText={(value) => patchField("quantity", value)}
            keyboardType="decimal-pad"
          />
          {isComplete ? null : (
            <ThemedText type="small">
              Username or PIN is missing. Save both in Settings, then return to
              Submit.
            </ThemedText>
          )}
          {prompt ? <ThemedText type="small">{prompt}</ThemedText> : null}
          {/*getApiDebugText() ? (
            <ThemedText type="small" themeColor="textSecondary" selectable>
              {getApiDebugText()}
            </ThemedText>
          ) : null*/}
          <UiButton
            label={checkBusy ? "Reading label…" : "Check"}
            disabled={checkBusy}
            onPress={() => void onCheck()}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Check uploads photos and fills empty label fields. Fields you typed
            stay as-is on a later Check. Quantity is never filled from the
            label.
          </ThemedText>
          <UiButton label="Submit" onPress={onSubmit} />
          {isComplete ? null : (
            <UiButton
              label="Open Settings"
              variant="outlined"
              onPress={() => router.push("/settings")}
            />
          )}
          <UiButton
            label="Back"
            variant="outlined"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
