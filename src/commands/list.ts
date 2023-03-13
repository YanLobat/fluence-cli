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

import { readFile } from "fs/promises";
import path from "path";

import { Args, Flags } from "@oclif/core";
import { parse } from "yaml";

import { BaseCommand, baseFlags } from "../baseCommand.js";
import { ServiceConfigReadonly } from "../lib/configs/project/service.js";
import { FS_OPTIONS, SERVICE_CONFIG_FILE_NAME } from "../lib/const.js";
import { initCli } from "../lib/lifecyle.js";

export default class List extends BaseCommand<typeof List> {
  static override description = "Print list of services";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {
    ...baseFlags,
    modules: Flags.boolean({
      description: `Print list of modules for every 
        service = tree-like structure of a project`,
    }),
    paths: Flags.boolean({
      description: `Print paths next to list of 
        services (eg --paths)`,
    }),
    json: Flags.boolean({
      description: `Print that structure in JSON (eg --json)`,
    }),
  };
  static override args = {
    path: Args.string({
      description: "Project path",
    }),
  };
  isServiceConfig(content: unknown): content is ServiceConfigReadonly {
    return typeof content === "object" && content !== null;
  }
  async run(): Promise<void> {
    const { flags, args, maybeFluenceConfig } = await initCli(
      this,
      await this.parse(List)
    );

    if (maybeFluenceConfig === null) {
      return;
    }

    const { services } = maybeFluenceConfig;

    if (services == null) {
      return;
    }

    const serviceList = Object.keys(services);

    if (flags.modules) {
      for (const serviceName of serviceList) {
        const service = services[serviceName];

        if (service == null) {
          return;
        }

        this.log(serviceName);
        const projectPath = args.path !== undefined ? args.path : "";

        const serviceConfigPath = path.join(
          projectPath,
          service.get,
          SERVICE_CONFIG_FILE_NAME
        );

        const content = await readFile(serviceConfigPath, FS_OPTIONS);

        const parsedContent: unknown = parse(content);

        if (
          this.isServiceConfig(parsedContent) &&
          parsedContent.modules !== undefined
        ) {
          this.log("\n");
          const modulesList = Object.keys(parsedContent.modules);

          for (const moduleName of modulesList) {
            this.log(`  ${moduleName}`);
          }
        }
      }

      return;
    }

    if (flags.paths) {
      // which paths should I display? paths for services which is args.path + service.get?
      return;
    }

    if (flags.json) {
      const json: { [key: string]: string[] } = {};

      for (const serviceName of serviceList) {
        const service = services[serviceName];

        if (service === undefined) {
          return;
        }

        json[serviceName] = [];

        const projectPath = args.path !== undefined ? args.path : "";
        const servicePath = path.join(projectPath, service.get, "service.yaml");
        const content = await readFile(servicePath, FS_OPTIONS);

        const parsedContent: unknown = parse(content);

        if (
          this.isServiceConfig(parsedContent) &&
          parsedContent.modules !== undefined
        ) {
          const modulesList = Object.keys(parsedContent.modules);

          for (const moduleName of modulesList) {
            json[serviceName]?.push(moduleName);
          }
        }
      }

      this.log(JSON.stringify(json));
      return;
    }

    for (const service of serviceList) {
      this.log(service);
    }
  }
}
