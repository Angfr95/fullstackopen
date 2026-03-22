import { useState, useEffect } from "react";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import PersonsList from "./components/PersonsList";
import {
  getPersons,
  addPersons,
  deletePerson,
  updatePerson,
} from "./services/persons";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [message, setMessage] = useState(null);
  const [notificationStyle, setNotificationStyle] = useState({});

  // Derived state
  const personsFilter = persons.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  useEffect(() => {
    getPersons().then(setPersons);
  }, []);

  const notify = (msg, color) => {
    setMessage(msg);
    setNotificationStyle({ color });
    setTimeout(() => setMessage(null), 5000);
  };

  const addPerson = (event) => {
    event.preventDefault();
    const elementFound = persons.find((p) => p.name === newName);
    if (elementFound) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, Do you want update information?`,
        )
      ) {
        updatePerson(elementFound.id, {
          ...elementFound,
          number: newNumber,
        }).then((updated) => {
          setPersons(
            persons.map((p) => (p.id === elementFound.id ? updated : p)),
          );
          notify(`Changed number of ${elementFound.name}`, "green");
        });
      }
    } else {
      const personToAdd = {
        name: newName,
        number: newNumber,
        id: String(persons.length + 1),
      };
      addPersons(personToAdd).then((added) => {
        setPersons(persons.concat(added));
        setNewName("");
        setNewNumber("");
        notify(`Added ${personToAdd.name}`, "green");
      });
    }
  };

  const clickDelete = (person) => {
    if (window.confirm(`Do you really want to delete ${person.name}?`)) {
      deletePerson(person.id)
        .then(() => {
          // Met à jour le state local → UI se met à jour immédiatement
          setPersons(persons.filter((p) => p.id !== person.id));
          notify(`Deleted ${person.name}`, "red");
        })
        .catch(() => {
          notify(
            `Information of '${person.name}' was already removed from server`,
            "red",
          );
          setPersons(persons.filter((p) => p.id !== person.id));
        });
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification styles={notificationStyle} message={message} />
      <Filter onChangeHandle={(e) => setFilterQuery(e.target.value)} />
      <h3>add a new</h3>
      <PersonForm
        submitForm={addPerson}
        nameValue={newName}
        nameHandle={(e) => setNewName(e.target.value)}
        numberValue={newNumber}
        numberHandle={(e) => setNewNumber(e.target.value)}
      />
      <h2>Numbers</h2>
      <PersonsList personArray={personsFilter} deleteHandle={clickDelete} />
    </div>
  );
};

export default App;
