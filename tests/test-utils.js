/**
 * Test Utilities
 *
 * A simple testing framework for running unit tests in the browser.
 * Provides functions for defining test suites, test cases, and assertions.
 */

class TestRunner {
    constructor() {
        this.suites = [];
        this.currentSuite = null;
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Define a test suite
     * @param {string} name - The name of the test suite
     * @param {Function} setupFn - Function to set up the test suite
     */
    suite(name, setupFn) {
        this.currentSuite = {
            name: name,
            tests: [],
            beforeEach: null,
            afterEach: null
        };

        this.suites.push(this.currentSuite);
        setupFn();
    }

    /**
     * Define a setup function to run before each test in the current suite
     * @param {Function} fn - Function to run before each test
     */
    beforeEach(fn) {
        if (!this.currentSuite) {
            throw new Error('beforeEach must be called within a suite');
        }
        this.currentSuite.beforeEach = fn;
    }

    /**
     * Define a cleanup function to run after each test in the current suite
     * @param {Function} fn - Function to run after each test
     */
    afterEach(fn) {
        if (!this.currentSuite) {
            throw new Error('afterEach must be called within a suite');
        }
        this.currentSuite.afterEach = fn;
    }

    /**
     * Define a test case
     * @param {string} name - The name of the test case
     * @param {Function} testFn - The test function
     */
    test(name, testFn) {
        if (!this.currentSuite) {
            throw new Error('test must be called within a suite');
        }

        this.currentSuite.tests.push({
            name: name,
            fn: testFn
        });
    }

    /**
     * Run all test suites
     * @param {Function} callback - Function to call when all tests are complete
     */
    async runAll(callback) {
        const startTime = performance.now();
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            suiteResults: []
        };

        for (const suite of this.suites) {
            const suiteResult = {
                name: suite.name,
                passed: 0,
                failed: 0,
                total: suite.tests.length,
                testResults: []
            };

            console.group(`Suite: ${suite.name}`);

            for (const test of suite.tests) {
                this.results.total++;
                suiteResult.total++;

                try {
                    // Run beforeEach if defined
                    if (suite.beforeEach) {
                        await suite.beforeEach();
                    }

                    // Create a new assertion context for this test
                    const assert = new Assert();

                    // Run the test
                    await test.fn(assert);

                    // If we got here, the test passed (no assertions failed)
                    this.results.passed++;
                    suiteResult.passed++;
                    suiteResult.testResults.push({
                        name: test.name,
                        passed: true
                    });

                    console.log(`✅ ${test.name}`);
                } catch (error) {
                    this.results.failed++;
                    suiteResult.failed++;
                    suiteResult.testResults.push({
                        name: test.name,
                        passed: false,
                        error: error.message
                    });

                    console.error(`❌ ${test.name}: ${error.message}`);
                } finally {
                    // Run afterEach if defined
                    if (suite.afterEach) {
                        try {
                            await suite.afterEach();
                        } catch (error) {
                            console.error(`Error in afterEach: ${error.message}`);
                        }
                    }
                }
            }

            console.groupEnd();
            this.results.suiteResults.push(suiteResult);
        }

        const endTime = performance.now();
        this.results.duration = (endTime - startTime).toFixed(2);

        if (callback) {
            callback(this.results);
        }

        return this.results;
    }

    /**
     * Display test results in the DOM
     * @param {HTMLElement} container - The container element to display results in
     * @param {Object} results - The test results object
     */
    displayResults(container, results = this.results) {
        if (!container) {
            throw new Error('Container element is required');
        }

        // Clear the container
        container.innerHTML = '';

        // Create the results header
        const header = document.createElement('div');
        header.className = 'test-header';

        const passRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
        const headerClass = passRate === 100 ? 'test-success' : 'test-failure';

        header.innerHTML = `
            <h2 class="${headerClass}">Test Results: ${results.passed}/${results.total} passed (${passRate}%)</h2>
            <p>Completed in ${results.duration}ms</p>
        `;

        container.appendChild(header);

        // Create results for each suite
        for (const suite of results.suiteResults) {
            const suiteElement = document.createElement('div');
            suiteElement.className = 'test-suite';

            const suitePassRate = suite.total > 0 ? Math.round((suite.passed / suite.total) * 100) : 0;
            const suiteClass = suitePassRate === 100 ? 'suite-success' : 'suite-failure';

            suiteElement.innerHTML = `
                <h3 class="${suiteClass}">${suite.name}: ${suite.passed}/${suite.total} passed</h3>
            `;

            const testList = document.createElement('ul');
            testList.className = 'test-list';

            for (const test of suite.testResults) {
                const testItem = document.createElement('li');
                testItem.className = test.passed ? 'test-passed' : 'test-failed';

                if (test.passed) {
                    testItem.innerHTML = `✅ ${test.name}`;
                } else {
                    testItem.innerHTML = `❌ ${test.name}: ${test.error}`;
                }

                testList.appendChild(testItem);
            }

            suiteElement.appendChild(testList);
            container.appendChild(suiteElement);
        }
    }
}

class Assert {
    /**
     * Assert that a condition is true
     * @param {boolean} condition - The condition to check
     * @param {string} message - The error message if the assertion fails
     */
    isTrue(condition, message = 'Expected condition to be true') {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is a function
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isFunction(value, message = 'Expected value to be a function') {
        if (typeof value !== 'function') {
            throw new Error(message);
        }
    }

    /**
     * Assert that a condition is false
     * @param {boolean} condition - The condition to check
     * @param {string} message - The error message if the assertion fails
     */
    isFalse(condition, message = 'Expected condition to be false') {
        if (condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert that two values are equal
     * @param {*} actual - The actual value
     * @param {*} expected - The expected value
     * @param {string} message - The error message if the assertion fails
     */
    equal(actual, expected, message = null) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    /**
     * Assert that two values are not equal
     * @param {*} actual - The actual value
     * @param {*} expected - The value that actual should not equal
     * @param {string} message - The error message if the assertion fails
     */
    notEqual(actual, expected, message = null) {
        if (actual === expected) {
            throw new Error(message || `Expected ${actual} to not equal ${expected}`);
        }
    }

    /**
     * Assert that a function throws an error
     * @param {Function} fn - The function to check
     * @param {string|RegExp} [expectedError] - The expected error message or pattern
     * @param {string} message - The error message if the assertion fails
     */
    throws(fn, expectedError = null, message = 'Expected function to throw an error') {
        try {
            fn();
            throw new Error(message);
        } catch (error) {
            if (error.message === message) {
                // This is our assertion error, rethrow it
                throw error;
            }

            // If an expected error was provided, check it
            if (expectedError) {
                if (typeof expectedError === 'string' && error.message !== expectedError) {
                    throw new Error(`Expected error message "${expectedError}", but got "${error.message}"`);
                } else if (expectedError instanceof RegExp && !expectedError.test(error.message)) {
                    throw new Error(`Expected error message to match ${expectedError}, but got "${error.message}"`);
                }
            }
        }
    }

    /**
     * Assert that a function does not throw an error
     * @param {Function} fn - The function to check
     * @param {string} message - The error message if the assertion fails
     */
    doesNotThrow(fn, message = 'Expected function not to throw an error') {
        try {
            fn();
        } catch (error) {
            throw new Error(`${message}: ${error.message}`);
        }
    }

    /**
     * Assert that a value is defined (not undefined)
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isDefined(value, message = 'Expected value to be defined') {
        if (value === undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is undefined
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isUndefined(value, message = 'Expected value to be undefined') {
        if (value !== undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is null
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isNull(value, message = 'Expected value to be null') {
        if (value !== null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is not null
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isNotNull(value, message = 'Expected value to not be null') {
        if (value === null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is an instance of a specific type
     * @param {*} value - The value to check
     * @param {Function} type - The constructor function
     * @param {string} message - The error message if the assertion fails
     */
    instanceOf(value, type, message = null) {
        if (!(value instanceof type)) {
            throw new Error(message || `Expected ${value} to be an instance of ${type.name}`);
        }
    }

    /**
     * Assert that a value is approximately equal to an expected value within a delta
     * @param {number} actual - The actual value
     * @param {number} expected - The expected value
     * @param {number} delta - The maximum difference allowed
     * @param {string} message - The error message if the assertion fails
     */
    approximately(actual, expected, delta, message = null) {
        if (typeof actual !== 'number' || typeof expected !== 'number' || typeof delta !== 'number') {
            throw new Error('approximately requires numeric values');
        }

        const diff = Math.abs(actual - expected);
        if (diff > delta) {
            throw new Error(message || `Expected ${actual} to be approximately ${expected} (within ${delta}), but the difference was ${diff}`);
        }
    }

    /**
     * Assert that a value is a number
     * @param {*} value - The value to check
     * @param {string} message - The error message if the assertion fails
     */
    isNumber(value, message = 'Expected value to be a number') {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error(message);
        }
    }

    /**
     * Assert that two objects are deeply equal
     * @param {*} actual - The actual value
     * @param {*} expected - The expected value
     * @param {string} message - The error message if the assertion fails
     */
    deepEqual(actual, expected, message = null) {
        // Simple case: same value or both null/undefined
        if (actual === expected) {
            return;
        }

        // If either is null/undefined but not both
        if (actual == null || expected == null) {
            throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }

        // Check if both are objects
        if (typeof actual === 'object' && typeof expected === 'object') {
            // Check if arrays
            if (Array.isArray(actual) && Array.isArray(expected)) {
                if (actual.length !== expected.length) {
                    throw new Error(message || `Arrays have different lengths: ${actual.length} vs ${expected.length}`);
                }

                for (let i = 0; i < actual.length; i++) {
                    try {
                        this.deepEqual(actual[i], expected[i]);
                    } catch (error) {
                        throw new Error(message || `Arrays differ at index ${i}: ${error.message}`);
                    }
                }
                return;
            }

            // Regular objects
            const actualKeys = Object.keys(actual);
            const expectedKeys = Object.keys(expected);

            // Check if they have the same keys
            if (actualKeys.length !== expectedKeys.length) {
                throw new Error(message || `Objects have different number of properties: ${actualKeys.length} vs ${expectedKeys.length}`);
            }

            // Check if all keys in expected exist in actual with the same values
            for (const key of expectedKeys) {
                if (!actual.hasOwnProperty(key)) {
                    throw new Error(message || `Expected object to have property '${key}'`);
                }

                try {
                    this.deepEqual(actual[key], expected[key]);
                } catch (error) {
                    throw new Error(message || `Objects differ at property '${key}': ${error.message}`);
                }
            }
            return;
        }

        // If we get here, the values are not equal
        throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }

    /**
     * Explicitly mark a test as passed
     * @param {string} message - An optional message
     */
    pass(message = 'Test passed') {
        // This method does nothing, as a test passes by default if no assertions fail
    }
}

// Create a global instance of the test runner
const testRunner = new TestRunner();

// Export the test runner functions as globals for easier use
window.suite = testRunner.suite.bind(testRunner);
window.test = testRunner.test.bind(testRunner);
window.beforeEach = testRunner.beforeEach.bind(testRunner);
window.afterEach = testRunner.afterEach.bind(testRunner);
window.runTests = testRunner.runAll.bind(testRunner);
window.displayResults = testRunner.displayResults.bind(testRunner);

// Export the TestRunner and Assert classes
export { TestRunner, Assert };