/**
 * Copyright 2023 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type ValidationResult = string | true;

export const validateUnique = <T>(
  array: Array<T>,
  getField: (item: T) => string,
  getError: (notUniqueField: string) => string
): ValidationResult => {
  const set = new Set();

  for (const item of array) {
    const field = getField(item);

    if (set.has(field)) {
      return getError(field);
    }

    set.add(field);
  }

  return true;
};

export const validateHasDefault = <T>(
  array: Array<T>,
  defaultValue: string,
  getField: (item: T) => string,
  errorText: string
): ValidationResult =>
  array.some((item): boolean => getField(item) === defaultValue) || errorText;

export const validateBatch = (
  ...args: Array<ValidationResult>
): ValidationResult =>
  args.reduce<ValidationResult>((acc, result): ValidationResult => {
    if (result === true) {
      return acc;
    }

    return `${acc === true ? "" : acc}\n\n${result}`;
  }, true);
