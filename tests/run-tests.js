/**
 * Test Runner Script
 * 
 * This script runs all tests and logs the results to the console.
 */

import { TestRunner, Assert } from './test-utils.js';

// Import test modules
import './core/service-locator.test.js';
import './core/game.test.js';
import './core/renderer.test.js';
import './core/input-handler.test.js';
import './core/timer.test.js';
import './core/event-bus.test.js';
import './core/entity-manager.test.js';
import './entities/entity.test.js';
import './entities/component.test.js';
import './systems/system.test.js';
import './systems/entity-system.test.js';

// Run all tests
const testRunner = new TestRunner();
testRunner.runAll(results => {
    console.log('Test Results:', results);
    
    // Log summary
    console.log(`Tests completed: ${results.passed}/${results.total} passed (${Math.round((results.passed / results.total) * 100)}%)`);
    
    // Log failed tests
    if (results.failed > 0) {
        console.log('Failed tests:');
        results.suiteResults.forEach(suite => {
            if (suite.failed > 0) {
                console.log(`Suite: ${suite.name}`);
                suite.testResults.forEach(test => {
                    if (!test.passed) {
                        console.log(`  ❌ ${test.name}: ${test.error}`);
                    }
                });
            }
        });
    }
});
