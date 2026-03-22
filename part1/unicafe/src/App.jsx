import { useState } from "react";

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>{text}</button>
);

const StatisticLine = ({ text, count, textCompl }) => (
  <tbody>
    <tr>
      <td>{text}:</td>
      <td>
        {count}
        {textCompl}
      </td>
    </tr>
  </tbody>
);

const Statistic = ({ good, neutral, bad }) => {
  const all = good + neutral + bad;
  const average = all === 0 ? 0 : ((good - bad) / all).toFixed(2);
  const positive = all === 0 ? 0 : ((good / all) * 100).toFixed(2);
  if (all === 0) return <h3>No feedback given</h3>;

  return (
    <div>
      <h1>Statistic</h1>
      <table>
        <StatisticLine text="Good" count={good} />
        <StatisticLine text="Neutral" count={neutral} />
        <StatisticLine text="Bad" count={bad} />
        <StatisticLine text="All" count={all} />
        <StatisticLine text="Average" count={average} />
        <StatisticLine text="Positive" count={positive} textCompl="%" />
      </table>
    </div>
  );
};

const App = () => {
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  return (
    <div>
      <h1>Give Feedback</h1>
      <Button handleClick={() => setGood(good + 1)} text="Good" />
      <Button handleClick={() => setNeutral(neutral + 1)} text="Neutral" />
      <Button handleClick={() => setBad(bad + 1)} text="Bad" />
      <Statistic good={good} neutral={neutral} bad={bad} />
    </div>
  );
};

export default App;
