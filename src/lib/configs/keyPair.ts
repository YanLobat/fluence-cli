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

import type { JSONSchemaType } from "ajv";

export type ConfigKeyPair = {
  peerId: string;
  secretKey: string;
  publicKey: string;
  name: string;
};

export const configKeyPairSchema: JSONSchemaType<ConfigKeyPair> = {
  title: "Key Pair",
  type: "object",
  properties: {
    peerId: { type: "string" },
    secretKey: { type: "string" },
    publicKey: { type: "string" },
    name: { type: "string" },
  },
  required: ["peerId", "secretKey", "publicKey", "name"],
};
