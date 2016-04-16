var fibonacciGenerator = require('./fibonacci');

var fibonacci = fibonacciGenerator();

movePrint(0);
movePrint(1);
movePrint(5);
movePrint(10);

function movePrint (count) {
    fibonacci.next(count);
    console.log(fibonacci.value());
}
