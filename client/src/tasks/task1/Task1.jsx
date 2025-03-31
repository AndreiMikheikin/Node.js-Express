import React, { useState, useEffect } from 'react';

function getNumWord(num, word1, word2, word5) {
  const dd = num % 100;
  if (dd >= 11 && dd <= 19) return word5;
  const d = num % 10;
  if (d === 1) return word1;
  if (d >= 2 && d <= 4) return word2;
  return word5;
}

const Task1 = () => {
  const [variants, setVariants] = useState([]);
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    fetchVariants();
    fetchStatistics();
  }, []);

  const fetchVariants = async () => {
    const response = await fetch('/api/task1/variants');
    const data = await response.json();
    setVariants(data);
  };

  const fetchStatistics = async () => {
    const response = await fetch('/api/task1/stat');
    const data = await response.json();
    setStatistics(data);
  };

  const handleVote = async (code) => {
    await fetch('/api/task1/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    fetchStatistics();
  };

  return (
    <div className="task1">
      <h2>Система голосования</h2>
      
      <div className="stats">
        <h3>Статистика:</h3>
        <ul>
          {statistics.map(stat => (
            <li key={stat.code}>
              Вариант {stat.code}: {stat.votes} {getNumWord(stat.votes, 'голос', 'голоса', 'голосов')}
            </li>
          ))}
        </ul>
      </div>

      <div className="variants">
        <h3>Выберите вариант:</h3>
        {variants.map(variant => (
          <button 
            key={variant.code}
            onClick={() => handleVote(variant.code)}
          >
            {variant.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Task1;
