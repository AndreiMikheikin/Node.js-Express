import React, { useEffect } from 'react';

const Task2 = () => {
  useEffect(() => {
    window.location.href = '/task2';
  }, []);

  return <p>Загрузка...</p>;
}

export default Task2;