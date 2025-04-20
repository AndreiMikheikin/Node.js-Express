import React, { useEffect } from 'react';

const Task4 = () => {
  useEffect(() => {
    window.location.href = '/task4';
  }, []);

  return <p>Загрузка...</p>;
}

export default Task4;