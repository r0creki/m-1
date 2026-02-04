module.exports = function handler(req, res) {
  try {
    res.setHeader("Content-Type", "text/plain");

    const slug = Array.isArray(req.query.slug)
      ? req.query.slug[0]
      : req.query.slug;

    if (!slug) {
      res.status(404).send("-- invalid endpoint");
      return;
    }

    const scripts = {
      "centaura":
        "print('[Pevolution] Centaura Loaded')\n" +
        "-- SCRIPT CENTAURA ASLI DI SINI\n",

      "aquamatrix":
        "print('[Pevolution] AquaMatrix Loaded')\n" +
        "https://raw.githubusercontent.com/yunus154524/scripts/refs/heads/main/anim2gui.lua",

      "spear-fishing":
        "print('[Pevolution] Spear Fishing Loaded')\n" +
        "-- SCRIPT SPEAR FISHING ASLI DI SINI\n",
    };

    if (!scripts[slug]) {
      res.status(404).send("-- unknown script");
      return;
    }

    const output =
      "-- Pevolution Private Script\n" +
      "if not game:IsLoaded() then game.Loaded:Wait() end\n\n" +
      scripts[slug];

    res.status(200).send(output);
  } catch (err) {
    res.status(500).send("-- server error");
  }
};
