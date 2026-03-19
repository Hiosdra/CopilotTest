import type { Step, StepKeyword, Scenario, Feature } from "./types.js";

export class ScenarioBuilder {
  private _steps: Step[] = [];
  private _tags: string[] = [];
  private _name: string;
  private _featureBuilder: FeatureBuilder;
  private _lastStep: Step | null = null;
  private _debugMode: boolean = false;

  constructor(name: string, featureBuilder: FeatureBuilder) {
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

  scenario(name: string): ScenarioBuilder {
    this._featureBuilder._addScenario(this._build());
    return new ScenarioBuilder(name, this._featureBuilder);
  }

  done(): FeatureBuilder {
    this._featureBuilder._addScenario(this._build());
    return this._featureBuilder;
  }

  private _addStep(keyword: StepKeyword, text: string): this {
    const step: Step = { keyword, text };
    this._steps.push(step);
    this._lastStep = step;
    return this;
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

export class BackgroundBuilder {
  private _steps: Step[] = [];
  private _featureBuilder: FeatureBuilder;
  private _lastStep: Step | null = null;

  constructor(featureBuilder: FeatureBuilder) {
    this._featureBuilder = featureBuilder;
  }

  given(text: string): this {
    return this._addStep("Given", text);
  }

  and(text: string): this {
    return this._addStep("And", text);
  }

  scenario(name: string): ScenarioBuilder {
    this._featureBuilder._setBackground(this._steps);
    return new ScenarioBuilder(name, this._featureBuilder);
  }

  private _addStep(keyword: StepKeyword, text: string): this {
    const step: Step = { keyword, text };
    this._steps.push(step);
    this._lastStep = step;
    return this;
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

export function feature(name: string): FeatureBuilder {
  return new FeatureBuilder(name);
}
