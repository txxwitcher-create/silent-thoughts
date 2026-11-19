# SILENT THOUGHTS — Content Architecture Schema

Stage 1 ships with clearly labelled development sample entries (`verificationStatus: "sample_placeholder"`) so no quotations, sources, Hadith numbers, or authenticity grades are fabricated.

## Target Production Volume (Stage 2+)
- **16 Approved Literary Authors** × 200 verified quotations = **3,200 quotations**
- **Prophet Muhammad ﷺ (Special Religious Profile)** = **1,000 authenticated Hadith**
- **Total Target**: **4,200 verified entries**

## Directory Layout
Each approved profile has its own standalone JSON array under `src/data/collections/<author-id>.json`. Replacing sample objects with verified entries automatically updates all counts, profiles, the Home feed, and the Full-Screen Quote Reader with zero UI code changes.

### Literary Quote Entry (`src/data/collections/<author-id>.json`)
```json
{
  "id": "william-shakespeare-001",
  "entryType": "literary",
  "authorId": "william-shakespeare",
  "text": "Verified quotation text...",
  "source": "Hamlet, Act III, Scene I",
  "originalLanguage": "Early Modern English",
  "translator": null,
  "verificationStatus": "verified"
}
```

### Authentic Hadith Entry (`src/data/collections/prophet-muhammad.json`)
```json
{
  "id": "prophet-muhammad-hadith-001",
  "entryType": "hadith",
  "authorId": "prophet-muhammad",
  "arabicText": "Verified Arabic script (optional if unavailable)",
  "englishTranslation": "Verified English translation...",
  "narrator": "Verified Companion narrator",
  "collection": "Canonical collection name",
  "hadithNumber": "Verified Hadith number",
  "chapter": "Book / Chapter title",
  "authenticityGrade": "Verified scholarly grading",
  "sourceReference": "Canonical edition / reference",
  "verificationStatus": "verified"
}
```
