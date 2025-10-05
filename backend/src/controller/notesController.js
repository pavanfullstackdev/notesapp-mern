export function getAllNotes(req, res) {
  res.status(200).send("you are at Notes home");
}

export function createNotes(req, res) {
  res.status(201).json({ message: "Notes created." });
}

export function updateNotes(req, res) {
  res.status(201).json({ message: "Notes created." });
}

export function deleteNotes (req, res) {
  res.status(201).json({ message: "Notes created." });
}
