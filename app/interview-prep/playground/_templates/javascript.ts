export const javascriptTemplate = {
  name: "JavaScript",
  files: [
    {
      name: "index.js",
      language: "javascript",
      isEntryPoint: true,
      content: `// JavaScript Starter Template
console.log("Hello, World!");

// Import the greeting module
const { greet, farewell } = require('./greeting');

// Import the utils module
const utils = require('./utils');

// Call the imported functions
const greeting = greet("JavaScript");
console.log(greeting);

const goodbye = farewell("JavaScript");
console.log(goodbye);

// Use the utility function
const numbers = [1, 2, 3, 4, 5];
const doubled = utils.doubleNumbers(numbers);
console.log("Doubled numbers:", doubled);

// Working with objects
const person = {
  name: "John",
  age: 30,
  greet() {
    return \`Hi, I'm \${this.name} and I'm \${this.age} years old.\`;
  }
};

console.log(person.greet());

// Return a value to see it in the output
"JavaScript execution complete!";`,
    },
    {
      name: "greeting.js",
      language: "javascript",
      content: `// Greeting module

/**
 * Greets a person by name
 * @param {string} name - The name to greet
 * @returns {string} The greeting message
 */
function greet(name) {
  return \`Hello, \${name}!\`;
}

/**
 * Says goodbye to a person by name
 * @param {string} name - The name to say goodbye to
 * @returns {string} The farewell message
 */
function farewell(name) {
  return \`Goodbye, \${name}!\`;
}

// Export the functions
module.exports = {
  greet,
  farewell
};`,
    },
    {
      name: "utils.js",
      language: "javascript",
      content: `// Utility functions

/**
 * Doubles each number in an array
 * @param {number[]} numbers - The array of numbers to double
 * @returns {number[]} A new array with doubled numbers
 */
function doubleNumbers(numbers) {
  return numbers.map(num => num * 2);
}

/**
 * Filters out even numbers from an array
 * @param {number[]} numbers - The array of numbers to filter
 * @returns {number[]} A new array with only odd numbers
 */
function filterOddNumbers(numbers) {
  return numbers.filter(num => num % 2 !== 0);
}

/**
 * Calculates the sum of all numbers in an array
 * @param {number[]} numbers - The array of numbers to sum
 * @returns {number} The sum of all numbers
 */
function sum(numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

// Export the functions
module.exports = {
  doubleNumbers,
  filterOddNumbers,
  sum
};`,
    },
    {
      name: "package.json",
      language: "json",
      content: `{
  "name": "javascript-playground",
  "version": "1.0.0",
  "description": "JavaScript playground example with multiple files",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "node test.js"
  },
  "dependencies": {}
}`,
    },
    {
      name: "test.js",
      language: "javascript",
      content: `// Test file for the JavaScript playground
const { greet, farewell } = require('./greeting');
const utils = require('./utils');

console.log('Running tests...');

// Test greeting module
const greeting = greet('Tester');
console.log('Greeting test:', greeting === 'Hello, Tester!' ? 'PASS' : 'FAIL');

const goodbye = farewell('Tester');
console.log('Farewell test:', goodbye === 'Goodbye, Tester!' ? 'PASS' : 'FAIL');

// Test utils module
const numbers = [1, 2, 3, 4, 5];
const doubled = utils.doubleNumbers(numbers);
console.log('Double test:', JSON.stringify(doubled) === '[2,4,6,8,10]' ? 'PASS' : 'FAIL');

const odds = utils.filterOddNumbers(numbers);
console.log('Filter test:', JSON.stringify(odds) === '[1,3,5]' ? 'PASS' : 'FAIL');

const total = utils.sum(numbers);
console.log('Sum test:', total === 15 ? 'PASS' : 'FAIL');

console.log('All tests completed!');
`,
    },
  ],
};
