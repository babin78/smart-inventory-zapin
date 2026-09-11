# Cloud Functions (F4)

HTTPS functions (2nd gen, `asia-south1`). Every catalog route runs Integrity + PIN middleware. Firestore and Storage client access is denied. **Check** uploads JPEGs with a signed URL, then Gemini Flash reads the pack.

## One-time setup (you)

1. Firebase project `smart-invy-zap` (Blaze).
2. `firebase login`
3. `.firebaserc` already has `projects.default`.
4. `firebase deploy --only firestore:rules,storage`
5. Hash a shop PIN: `cd functions && npm run hash-pin -- YOUR_PIN`
6. Emulator: copy `.env.example` to `.env.local`. Set `SHOP_PIN_HASH`, `INTEGRITY_MODE=debug`, and `GEMINI_API_KEY`.
7. Production secrets:
   - `firebase functions:secrets:set SHOP_PIN_HASH`
   - `firebase functions:secrets:set GEMINI_API_KEY`
8. `firebase deploy --only functions`
9. Let the default Compute Engine service account sign Storage URLs (needed for Check). In Google Cloud Console: IAM → Service accounts → `648300021335-compute@developer.gserviceaccount.com` → Permissions → Grant access. Principal is that same email. Role: **Service Account Token Creator**. Save, wait about a minute, then Check again. No new APK and no functions redeploy.
10. Grant that same account **Storage Object Admin** on bucket `smart-invy-zap.firebasestorage.app` (Cloud Storage → bucket → Permissions). Signed PUT uploads need this; deny-all Storage rules do not apply to those URLs.

```powershell
gcloud services enable iam.googleapis.com --project=smart-invy-zap
gcloud iam service-accounts add-iam-policy-binding 648300021335-compute@developer.gserviceaccount.com --member="serviceAccount:648300021335-compute@developer.gserviceaccount.com" --role="roles/iam.serviceAccountTokenCreator" --project=smart-invy-zap
```

The app `app.json` `extra.functionsBaseUrl` is `https://asia-south1-smart-invy-zap.cloudfunctions.net`. After deploy, Check on the phone uses that URL plus the PIN in Settings.

## Prove merge (no Gemini)

```bash
cd functions && npm run test
```

## Prove Check (after deploy)

1. Settings: username + the same PIN you hashed.
2. Capture a front photo.
3. Check — name/MRP should fill when the label is readable.
4. Change the name on Review.
5. Add a rear/extra photo, Check again — dates/size can fill; **the name you typed must stay**.
