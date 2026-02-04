export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");

  const { slug } = req.query;

  if (!slug) {
    res.status(404).send("-- invalid endpoint");
    return;
  }

  const scripts = {
print("[Pevolution] Centaura Loaded")
-- SCRIPT CENTAURA ASLI DI SINI
`,

    "aquamatrix": `
print("[Pevolution] AquaMatrix Loaded")
-- SCRIPT AQUAMATRIX ASLI DI SINI
`,

    "spear-fishing": `
print("[Pevolution] Spear Fishing Loaded")
-- SCRIPT SPEAR FISHING ASLI DI SINI
`,
  };

  if (!scripts[slug]) {
    res.status(404).send("-- unknown script");
    return;
  }

  const output =
`-- Pevolution Private Script
if not game:IsLoaded() then game.Loaded:Wait() end

${scripts[slug]}
`;

  res.status(200).send(output);
}
