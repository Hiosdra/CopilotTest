import type { Step, StepKeyword, Scenario, Feature } from "./types.js";

/**
 * Base class for step builders to reduce code duplication
 */
abstract class BaseStepBuilder {
  protected _steps: Step[] = [];
  protected _lastStep: Step | null = null;

  protected _addStep(keyword: StepKeyword, text: string): this {
    const step: Step = { keyword, text };
    this._steps.push(step);
    this._lastStep = step;
    return this;
  }

  given(text: string): this {
    return this._addStep("Given", text);
  }

  when(text: string): this {
    return this._addStep("When", text);
  }

  then(text: string): this {
    return this._addStep("Then", text);
  }

  and(text: string): this {
    return this._addStep("And", text);
  }

  but(text: string): this {
    return this._addStep("But", text);
  }

  withTable(table: string[][]): this {
    if (this._lastStep) {
      this._lastStep.table = table;
    }
    return this;
  }

  withDocString(docString: string): this {
    if (this._lastStep) {
      this._lastStep.docString = docString;
    }
    return this;
  }
}

export class ScenarioBuilder extends BaseStepBuilder {
  private _tags: string[] = [];
  private _name: string;
  private _featureBuilder: FeatureBuilder;
  private _debugMode: boolean = false;

  constructor(name: string, featureBuilder: FeatureBuilder) {
    super();
    this._name = name;
    this._featureBuilder = featureBuilder;
  }

  tag(...tags: string[]): this {
    this._tags.push(...tags);
    return this;
  }

  debug(): this {
    this._debugMode = true;
    return this;
  }

  scenario(name: string): ScenarioBuilder {
    this._featureBuilder._addScenario(this._build());
    return new ScenarioBuilder(name, this._featureBuilder);
  }

  done(): FeatureBuilder {
    this._featureBuilder._addScenario(this._build());
    return this._featureBuilder;
  }

  _build(): Scenario {
    return {
      name: this._name,
      tags: this._tags,
      steps: [...this._steps],
      debugMode: this._debugMode,
    };
  }
}

export class ScenarioOutlineBuilder extends BaseStepBuilder {
  private _tags: string[] = [];
  private _name: string;
  private _featureBuilder: FeatureBuilder;
  private _examples?: Record<string, string>[];

  constructor(name: string, featureBuilder: FeatureBuilder) {
    super();
    this._name = name;
    this._featureBuilder = featureBuilder;
  }

  tag(...tags: string[]): this {
    this._tags.push(...tags);
    return this;
  }

  examples(data: Record<string, string>[]): this {
    this._examples = data;
    return this;
  }

  scenarioOutline(name: string): ScenarioOutlineBuilder {
    this._featureBuilder._addScenario(this._build());
    return new ScenarioOutlineBuilder(name, this._featureBuilder);
  }

  scenario(name: string): ScenarioBuilder {
    this._featureBuilder._addScenario(this._build());
    return new ScenarioBuilder(name, this._featureBuilder);
  }

  done(): FeatureBuilder {
    this._featureBuilder._addScenario(this._build());
    return this._featureBuilder;
  }

  _build(): Scenario {
    if (!this._examples || this._examples.length === 0) {
      throw new Error(
        `Scenario Outline "${this._name}" must have at least one example. Call .examples([...]) before .done()`
      );
    }
    return {
      name: this._name,
      tags: this._tags,
      steps: [...this._steps],
      examples: this._examples,
      isOutline: true,
    };
  }
}

export class BackgroundBuilder extends BaseStepBuilder {
  private _featureBuilder: FeatureBuilder;

  constructor(featureBuilder: FeatureBuilder) {
    super();
    this._featureBuilder = featureBuilder;
  }

  scenario(name: string): ScenarioBuilder {
    this._featureBuilder._setBackground(this._steps);
    return new ScenarioBuilder(name, this._featureBuilder);
  }
}

export class FeatureBuilder {
  private _name: string;
  private _description?: string;
  private _tags: string[] = [];
  private _background?: Step[];
  private _scenarios: Scenario[] = [];

  constructor(name: string) {
    this._name = name;
  }

  tag(...tags: string[]): this {
    this._tags.push(...tags);
    return this;
  }

  description(text: string): this {
    this._description = text;
    return this;
  }

  background(): BackgroundBuilder {
    return new BackgroundBuilder(this);
  }

  scenario(name: string): ScenarioBuilder {
    return new ScenarioBuilder(name, this);
  }

  scenarioOutline(name: string): ScenarioOutlineBuilder {
    return new ScenarioOutlineBuilder(name, this);
  }

  _addScenario(scenario: Scenario): void {
    this._scenarios.push(scenario);
  }

  _setBackground(steps: Step[]): void {
    this._background = steps;
  }

  _build(): Feature {
    return {
      name: this._name,
      description: this._description,
      tags: this._tags,
      background: this._background,
      scenarios: this._scenarios,
    };
  }
}

/**
 * Create a new feature with BDD scenarios.
 *
 * Features organize related test scenarios and provide a high-level description
 * of the functionality being tested. This is the entry point for the fluent DSL.
 *
 * @example
 * Basic feature with scenarios:
 * ```typescript
 * feature('User Authentication')
 *   .scenario('Successful login')
 *     .given('I am on the login page')
 *     .when('I enter valid credentials')
 *     .then('I should see the dashboard')
 *   .scenario('Failed login')
 *     .given('I am on the login page')
 *     .when('I enter invalid credentials')
 *     .then('I should see an error message');
 * ```
 *
 * @example
 * Feature with tags and description:
 * ```typescript
 * feature('Shopping Cart')
 *   .tag('@smoke', '@critical')
 *   .description('Test shopping cart functionality')
 *   .scenario('Add item to cart')
 *     .given('I am viewing a product')
 *     .when('I click the add to cart button')
 *     .then('the item should be in my cart');
 * ```
 *
 * @example
 * Feature with background steps:
 * ```typescript
 * feature('Account Management')
 *   .background()
 *     .given('I am logged in as an admin')
 *     .and('I am on the users page')
 *   .scenario('Create new user')
 *     .when('I click create user')
 *     .then('a new user should be created');
 * ```
 *
 * @param name - The feature name (should be descriptive and clear)
 * @returns A new FeatureBuilder instance for chaining
 */
export function feature(name: string): FeatureBuilder {
  return new FeatureBuilder(name);
}
