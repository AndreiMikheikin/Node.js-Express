const factorialSum = (n) => {
    if (n < 0 || isNaN(n)) {
        console.log('Введите корректное неотрицательное число.');
        return;
    }

    // Функция для вычисления факториала
    const factorial = (num) => {
        let result = BigInt(1);
        for (let i = 2; i <= num; i++) {
            result *= BigInt(i);
        }
        return result;
    };

    // Функция для подсчёта суммы цифр
    const sumOfDigits = (num) => {
        return num.toString()
            .split('')
            .reduce((sum, digit) => sum + Number(digit), 0);
    };

    const fact = factorial(n);
    const sum = sumOfDigits(fact);

    console.log(`Факториал числа ${n}: ${fact}`);
    console.log(`Сумма цифр факториала: ${sum}`);
};

const inputNumber = parseInt(process.argv[2], 10) || 10;
factorialSum(inputNumber);
