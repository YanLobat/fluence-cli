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

import {
  ModuleType,
  MODULE_CONFIG_FILE_NAME,
  MODULE_TYPES,
  MODULE_TYPE_COMPILED,
  MODULE_TYPE_RUST,
  TOP_LEVEL_SCHEMA_ID,
} from "../../const.js";
import { ensureModuleAbsolutePath } from "../../helpers/downloadFile.js";
import { ensureFluenceDir } from "../../paths.js";
import {
  getConfigInitFunction,
  InitConfigOptions,
  InitializedConfig,
  InitializedReadonlyConfig,
  getReadonlyConfigInitFunction,
  Migrations,
  GetDefaultConfig,
} from "../initConfig.js";

export type ConfigV0 = {
  version: 0;
  name: string;
  type?: ModuleType;
  maxHeapSize?: string;
  loggerEnabled?: boolean;
  loggingMask?: number;
  volumes?: Record<string, string>;
  preopenedFiles?: Array<string>;
  envs?: Record<string, string>;
  mountedBinaries?: Record<string, string>;
};

const modulePropertiesV0 = {
  type: {
    type: "string",
    enum: MODULE_TYPES,
    nullable: true,
    default: MODULE_TYPE_COMPILED,
    description: `Module type "${MODULE_TYPE_COMPILED}" is for the precompiled modules. Module type "${MODULE_TYPE_RUST}" is for the source code written in rust which can be compiled into a Marine module`,
  },
  name: {
    type: "string",
    description: `"name" property from the Cargo.toml (for module type "${MODULE_TYPE_RUST}") or name of the precompiled .wasm file (for module type "${MODULE_TYPE_COMPILED}")`,
  },
  maxHeapSize: {
    type: "string",
    nullable: true,
    description: `Max size of the heap that a module can allocate in format: [number][whitespace?][specificator?] where ? is an optional field and specificator is one from the following (case-insensitive):\n
K, Kb - kilobyte\n
Ki, KiB - kibibyte\n
M, Mb - megabyte\n
Mi, MiB - mebibyte\n
G, Gb - gigabyte\n
Gi, GiB - gibibyte\n
Current limit is 4 GiB`,
  },
  loggerEnabled: {
    type: "boolean",
    nullable: true,
    description: "Set true to allow module to use the Marine SDK logger",
  },
  loggingMask: {
    type: "number",
    nullable: true,
    description: `Used for logging management. Example:
\`\`\`rust
const TARGET_MAP: [(&str, i64); 4] = [
("instruction", 1 << 1),
("data_cache", 1 << 2),
("next_peer_pks", 1 << 3),
("subtree_complete", 1 << 4),
];
pub fn main() {
use std::collections::HashMap;
use std::iter::FromIterator;

let target_map = HashMap::from_iter(TARGET_MAP.iter().cloned());

marine_rs_sdk::WasmLoggerBuilder::new()
    .with_target_map(target_map)
    .build()
    .unwrap();
}
#[marine]
pub fn foo() {
log::info!(target: "instruction", "this will print if (loggingMask & 1) != 0");
log::info!(target: "data_cache", "this will print if (loggingMask & 2) != 0");
}
\`\`\`
`,
  },
  volumes: {
    type: "object",
    nullable: true,
    required: [],
    title: "Volumes",
    description: `A map of accessible files and their aliases. Aliases should be used in Marine module development because it's hard to know the full path to a file. (This property replaces the legacy "mapped_dirs" property so there is no need to duplicate the same paths in "preopenedFiles" dir)`,
  },
  preopenedFiles: {
    type: "array",
    title: "Preopened files",
    description:
      "A list of files and directories that this module could access with WASI",
    items: {
      type: "string",
    },
    nullable: true,
  },
  envs: {
    type: "object",
    title: "Environment variables",
    nullable: true,
    required: [],
    description: `environment variables accessible by a particular module with standard Rust env API like this: std::env::var(IPFS_ADDR_ENV_NAME).

Please note that Marine adds three additional environment variables. Module environment variables could be examined with repl`,
  },
  mountedBinaries: {
    title: "Mounted binaries",
    type: "object",
    nullable: true,
    required: [],
    description: `A map of binary executable files that module is allowed to call. Example: curl: /usr/bin/curl`,
  },
  version: { type: "number", const: 0 },
} as const;

const configSchemaV0: JSONSchemaType<ConfigV0> = {
  type: "object",
  $id: `${TOP_LEVEL_SCHEMA_ID}/${MODULE_CONFIG_FILE_NAME}`,
  title: MODULE_CONFIG_FILE_NAME,
  description: `Defines [Marine Module](https://fluence.dev/docs/build/concepts/#modules). For Fluence CLI, **module** - is a directory which contains this config and either a precompiled .wasm Marine module or a source code of the module written in Rust which can be compiled into a .wasm Marine module. You can use \`fluence module new\` command to generate a template for new module`,
  properties: modulePropertiesV0,
  required: ["version", "name"],
};

const migrations: Migrations<Config> = [];
type Config = ConfigV0;
type LatestConfig = ConfigV0;
export type ModuleConfig = InitializedConfig<LatestConfig>;
export type ModuleConfigReadonly = InitializedReadonlyConfig<LatestConfig>;

const getInitConfigOptions = (
  configPath: string
): InitConfigOptions<Config, LatestConfig> => ({
  allSchemas: [configSchemaV0],
  latestSchema: configSchemaV0,
  migrations,
  name: MODULE_CONFIG_FILE_NAME,
  getSchemaDirPath: ensureFluenceDir,
  getConfigOrConfigDirPath: (): string => configPath,
});

export const initModuleConfig = async (
  configOrConfigDirPathOrUrl: string,
  absolutePath?: string | undefined
): Promise<InitializedConfig<LatestConfig> | null> =>
  getConfigInitFunction(
    getInitConfigOptions(
      absolutePath === undefined
        ? configOrConfigDirPathOrUrl
        : await ensureModuleAbsolutePath(
            configOrConfigDirPathOrUrl,
            absolutePath
          )
    )
  )();
export const initReadonlyModuleConfig = async (
  configOrConfigDirPathOrUrl: string,
  absolutePath?: string | undefined
): Promise<InitializedReadonlyConfig<LatestConfig> | null> =>
  getReadonlyConfigInitFunction(
    getInitConfigOptions(
      absolutePath === undefined
        ? configOrConfigDirPathOrUrl
        : await ensureModuleAbsolutePath(
            configOrConfigDirPathOrUrl,
            absolutePath
          )
    )
  )();

const getDefault: (name: string) => GetDefaultConfig<LatestConfig> =
  (name: string): GetDefaultConfig<LatestConfig> =>
  (): LatestConfig => ({
    version: 0,
    type: MODULE_TYPE_RUST,
    name,
  });

export const initNewReadonlyModuleConfig = (
  configPath: string,
  name: string
): Promise<InitializedReadonlyConfig<LatestConfig> | null> =>
  getReadonlyConfigInitFunction(
    getInitConfigOptions(configPath),
    getDefault(name)
  )();

export const moduleSchema: JSONSchemaType<LatestConfig> = configSchemaV0;
export const moduleProperties = modulePropertiesV0;
