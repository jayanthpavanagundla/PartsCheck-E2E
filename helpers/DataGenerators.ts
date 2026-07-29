import { Locator } from "@playwright/test";

export class DataGenerators {
  /** Generates a numeric string of the given length, e.g. randomNumber(9) -> "483920175" */
  static randomNumber(digits: number): string {
    let result = "";
    for (let i = 0; i < digits; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  /** Generates an uppercase alphanumeric string of the given length */
  static randomString(prefix: string, length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";

    for (let i = 0; i < length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${prefix}${randomPart}`;
  }

  /** Returns a random colour name */
  static randomColor(): string {
    const colors = [
      "Red",
      "Blue",
      "Black",
      "White",
      "Silver",
      "Grey",
      "Green",
      "Yellow",
      "Orange",
      "Maroon",
    ];
    return this.randomFromArray(colors);
  }

  /** Picks a random element from any array */
  static randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Returns all real option values from a <select>, excluding the
   * "Please select" placeholder (value="-1") by default.
   */
  static async getSelectableValues(
    dropdown: Locator,
    excludePlaceholder: boolean = true,
  ): Promise<string[]> {
    const options = await dropdown.locator("option").all();
    const values: string[] = [];
    for (const option of options) {
      const value = await option.getAttribute("value");
      if (value && (!excludePlaceholder || value !== "-1")) {
        values.push(value);
      }
    }
    return values;
  }

  /** Selects a random real option from a <select> and returns the value chosen */
  static async selectRandomOption(
    dropdown: Locator,
    excludePlaceholder: boolean = true,
  ): Promise<string> {
    const values = await this.getSelectableValues(dropdown, excludePlaceholder);
    const value = this.randomFromArray(values);
    await dropdown.selectOption(value);
    return value;
  }
}
