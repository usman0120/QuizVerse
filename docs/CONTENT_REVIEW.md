# Content review policy and verified corrections

## Safe cleanup

On November 9, 2026, **864 exact duplicates** were removed, reducing raw quiz records from **3,891 to 3,027** across the same 27 banks. Comparison ignores only the ID; all other fields must match. Retained records preserve their original IDs, ordering, text, translations, choices, explanations, and hints.

- `docs/content-cleanup.json` records each removed ID, retained ID, and content fingerprint.
- `docs/content-review.json` records the **115 remaining variant groups**, including possible answer conflicts. Differing versions have **not** been removed or declared correct automatically.
- `npm run audit:content` regenerates the review report without changing content.
- `npm run clean:content` applies exact-only cleanup; review the Git diff before committing.

## Verified editorial corrections

| Record        | Problem                                                                                             | Correction                                                                                                                                           | Evidence                                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| History ID 16 | Asked which explorer personally completed the first circumnavigation while grading Magellan correct | Ask who initially led the expedition; explain that Elcano completed the voyage after Magellan's death. English and Urdu updated                      | [Royal Museums Greenwich, National Maritime Museum](https://www.rmg.co.uk/collections/objects/rmgc-object-39741) describes Elcano bringing the expedition home after Magellan's death |
| History ID 81 | “Last pharaoh” wording omitted Cleopatra's co-ruler Caesarion                                       | Replace the ambiguous claim with a question about Cleopatra ruling jointly with her son; identify him as Ptolemy XV Caesar. English and Urdu updated | [Encyclopaedia Britannica](https://kids.britannica.com/students/article/Cleopatra/273700) identifies Caesarion as her co-ruler                                                        |

Sources were consulted directly. These corrections do **not** certify the rest of the collection. Religious quotations, Urdu literary attribution, time-sensitive facts, and alternative question versions still require authoritative evidence and editorial review; uncertain material is not rewritten by guessing.
