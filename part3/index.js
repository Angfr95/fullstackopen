const express = require("express");
const app = express();

const morgan = require("morgan");

morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);
app.use(express.json());

const persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" },
];

// 3.1 - liste des personnes
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

// 3.2 - info
app.get("/info", (req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `);
});

// 3.3 - une personne par id
app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((p) => p.id === req.params.id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// 3.4 - delete
app.delete("/api/persons/:id", (req, res) => {
  persons.splice(
    persons.findIndex((p) => p.id === req.params.id),
    1,
  );
  res.status(204).end();
});

// 3.5 - add
app.use(express.json());
app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number missing" });
  }
  if (persons.find((p) => p.name === body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }
  const person = {
    id: String(Math.floor(Math.random() * 1000000)),
    name: body.name,
    number: body.number,
  };
  persons.push(person);
  res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
