import React from "react";

const Task2 = () => {
    return (
        <div>
            <h1>Форма обратной связи</h1>

            {/* SUCCESS_MESSAGE */}

            <form method="POST" action="/submit">
                <div>
                    <label>Логин*:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {/* LOGIN_ERROR */}
                </div>

                <div>
                    <label htmlFor="password">Пароль*:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {/* PASSWORD ERROR */}
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Войти
                </button>
            </form>
        </div>
    )
};

export default Task2;