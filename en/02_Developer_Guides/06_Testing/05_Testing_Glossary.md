---
title: Testing Glossary
summary: All the jargon you need to be a bonafide testing guru
---

<dl>
<dt>Assertion</dt>
<dd>A predicate statement that must be true when a test runs.</dd>

<dt>Behat</dt>
<dd>A behaviour-driven testing library used with Silverstripe CMS as a higher-level alternative to the <code class="language-text">FunctionalTest</code> API, see <a href="https://behat.org">https://behat.org</a>.</dd>

<dt>Test Case</dt>
<dd>The atomic class type in most unit test frameworks. New unit tests are created by inheriting from the base test case.</dd>

<dt>Test Suite</dt>
<dd>Also known as a 'test group', a composite of test cases, used to collect individual unit tests into packages, allowing all tests to be run at once.</dd>

<dt>Fixture</dt>
<dd>Usually refers to the runtime context of a unit test - the environment and data prerequisites that must be in place in order to run the test and expect a particular outcome. Most unit test frameworks provide methods that can be used to create fixtures for the duration of a test - <code class="language-text">setUp</code> - and clean them up after the test is done - <code class="language-text">tearDown</code>.</dd>

<dt>Refactoring</dt>
<dd>A behavior preserving transformation of code. If you change the code, while keeping the actual functionality the same, it is refactoring. If you change the behavior or add new functionality it's not.</dd>

<dt>Smell</dt>
<dd>A code smell is a symptom of a problem. Usually refers to code that is structured in a way that will lead to problems with maintenance or understanding.</dd>

<dt>Spike</dt>
<dd>A limited and throwaway sketch of code or experiment to get a feel for how long it will take to implement a certain feature, or a possible direction for how that feature might work.</dd>

<dt>Test Double</dt>
<dd>Also known as a 'Substitute'. A general term for a dummy object that replaces a real object with the same interface. Substituting objects is useful when a real object is difficult or impossible to incorporate into a unit test.</dd>

<dt>Fake Object</dt>
<dd> A substitute object that simply replaces a real object with the same interface, and returns a pre-determined (usually fixed) value from each method.</dd>

<dt>Mock Object</dt>
<dd>A substitute object that mimics the same behavior as a real object (some people think of mocks as "crash test dummy" objects). Mocks differ from other kinds of substitute objects in that they must understand the context of each call to them, setting expectations of which, and what order, methods will be invoked and what parameters will be passed.</dd>

<dt>Test-Driven Development (TDD)</dt>
<dd>A style of programming where tests for a new feature are constructed before any code is written. Code to implement the feature is then written with the aim of making the tests pass. Testing is used to understand the problem space and discover suitable APIs for performing specific actions.</dd>

<dt>Behavior Driven Development (BDD)</dt>
<dd>An extension of the test-driven programming style, where tests are used primarily for describing the specification of how code should perform. In practice, there's little or no technical difference - it all comes down to language. In BDD, the usual terminology is changed to reflect this change of focus, so <em>Specification</em> is used in place of <em>Test Case</em>, and <em>should</em> is used in place of <em>expect</em> and <em>assert</em>.</dd>
</dl>
