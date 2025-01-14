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

import assert from "node:assert";

import oclifColor from "@oclif/color";
const color = oclifColor.default;

import { buildModules } from "./build.js";
import { commandObj } from "./commandObj.js";
import type { UploadArgConfig } from "./compiled-aqua/installation-spell/config.js";
import { spellInstallAirScript } from "./compiled-aqua/installation-spell/spell.js";
import type { InitializedReadonlyConfig } from "./configs/initConfig.js";
import type { FluenceConfig } from "./configs/project/fluence.js";
import { initFluenceLockConfig } from "./configs/project/fluenceLock.js";
import {
  ConfigV0,
  initReadonlyModuleConfig,
} from "./configs/project/module.js";
import {
  FACADE_MODULE_NAME,
  initReadonlyServiceConfig,
} from "./configs/project/service.js";
import { FLUENCE_CONFIG_FILE_NAME } from "./const.js";
import {
  downloadModule,
  getModuleWasmPath,
  getUrlOrAbsolutePath,
  isUrl,
} from "./helpers/downloadFile.js";
import { moduleToJSONModuleConfig } from "./helpers/moduleToJSONModuleConfig.js";
import { initMarineCli } from "./marineCli.js";
import { projectRootDir } from "./paths.js";

export const parseWorkers = (workerNamesString: string) =>
  workerNamesString.split(",").map((s) => s.trim());

type PrepareForDeployArg = {
  workerNames: string | undefined;
  fluenceConfig: FluenceConfig;
  hosts?: boolean;
};

export const prepareForDeploy = async ({
  workerNames: workerNamesString,
  fluenceConfig,
  hosts = false,
}: PrepareForDeployArg): Promise<UploadArgConfig> => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const hostsOrDeals = Object.entries(
    (hosts ? fluenceConfig.hosts : fluenceConfig.deals) ??
      commandObj.error(
        `You must have a ${color.yellow(
          hosts ? "hosts" : "deals"
        )} property in ${FLUENCE_CONFIG_FILE_NAME} that contains a record with at least one worker name as a key`
      )
  ) as Array<
    [
      string,
      (
        | (typeof fluenceConfig.hosts)[keyof typeof fluenceConfig.hosts]
        | (typeof fluenceConfig.deals)[keyof typeof fluenceConfig.deals]
      )
    ]
  >;

  const workerNamesSet = hostsOrDeals.map(([workerName]) => workerName);

  const workersToHost =
    workerNamesString === undefined
      ? workerNamesSet
      : parseWorkers(workerNamesString);

  if (workersToHost.length === 0) {
    return commandObj.error(
      `${color.yellow(
        hosts ? "hosts" : "deals"
      )} record in ${FLUENCE_CONFIG_FILE_NAME} must contain at least one worker name as a key`
    );
  }

  const { services: servicesFromFluenceConfig } = fluenceConfig;

  if (servicesFromFluenceConfig === undefined) {
    return commandObj.error(
      `You must have a ${color.yellow(
        "services"
      )} property in ${FLUENCE_CONFIG_FILE_NAME} that contains a record with at least one service as a key`
    );
  }

  const { workers: workersFromFluenceConfig } = fluenceConfig;

  if (workersFromFluenceConfig === undefined) {
    return commandObj.error(
      `You must have a ${color.yellow(
        "workers"
      )} property in ${FLUENCE_CONFIG_FILE_NAME} that contains a record with at least one worker name as a key`
    );
  }

  const workersFromFluenceConfigArray = Object.keys(workersFromFluenceConfig);

  const workerNamesNotFoundInWorkersConfig = workersToHost.filter(
    (workerName) => !workersFromFluenceConfigArray.includes(workerName)
  );

  if (workerNamesNotFoundInWorkersConfig.length !== 0) {
    commandObj.error(
      `Wasn't able to find workers ${workerNamesNotFoundInWorkersConfig
        .map((workerName) => color.yellow(workerName))
        .join(", ")} in ${color.yellow(
        FLUENCE_CONFIG_FILE_NAME
      )} please check the spelling and try again`
    );
  }

  const workerConfigs = workersToHost.map((workerName) => {
    const workerConfig = workersFromFluenceConfig[workerName];

    assert(
      workerConfig !== undefined,
      `Unreachable. workerNamesNotFoundInWorkersConfig was empty but error still happened. Looking for ${workerName} in ${JSON.stringify(
        workersFromFluenceConfig
      )}`
    );

    if (workerConfig.services.length === 0) {
      return commandObj.error(
        `All workers must have at least one service. Worker ${color.yellow(
          workerName
        )} listed in ${FLUENCE_CONFIG_FILE_NAME} ${color.yellow(
          "workers"
        )} property does not have any services`
      );
    }

    return {
      workerName,
      workerConfig,
    };
  });

  const serviceNames = [
    ...new Set(
      workerConfigs.flatMap(({ workerConfig }) => workerConfig.services)
    ),
  ];

  const serviceConfigs = await Promise.all(
    serviceNames.map((serviceName) =>
      (async () => {
        const maybeService = servicesFromFluenceConfig[serviceName];

        assert(
          maybeService !== undefined,
          `Unreachable. can't find service ${serviceName} from workers property in ${FLUENCE_CONFIG_FILE_NAME} in services property. This has to be checked on config init. Looking for ${serviceName} in ${JSON.stringify(
            servicesFromFluenceConfig
          )}`
        );

        const { get, overrideModules } = maybeService;

        const serviceConfig = await initReadonlyServiceConfig(
          get,
          projectRootDir
        );

        if (serviceConfig === null) {
          return commandObj.error(
            isUrl(get)
              ? `Downloaded invalid service ${color.yellow(
                  serviceName
                )} from ${color.yellow(get)}`
              : `Invalid service ${color.yellow(serviceName)} at ${color.yellow(
                  get
                )}`
          );
        }

        return {
          serviceName,
          overrideModules,
          serviceConfig,
        };
      })()
    )
  );

  const modulesUrls = [
    ...new Set(
      serviceConfigs
        .flatMap(({ serviceConfig }) =>
          Object.values(serviceConfig.modules).map(({ get }) => get)
        )
        .filter((get) => isUrl(get))
    ),
  ];

  const downloadedModulesMap = new Map<string, string>(
    await Promise.all(
      modulesUrls.map(
        (url): Promise<[string, string]> =>
          (async () => [url, await downloadModule(url)])()
      )
    )
  );

  const localModuleAbsolutePaths = serviceConfigs
    .flatMap(({ serviceConfig }) =>
      Object.values(serviceConfig.modules).map(({ get }) => ({
        get,
        serviceDirPath: serviceConfig.$getDirPath(),
      }))
    )
    .filter(({ get }) => !isUrl(get))
    .map(
      ({ get, serviceDirPath }) =>
        [get, getUrlOrAbsolutePath(get, serviceDirPath)] as const
    );

  const moduleConfigsMap = new Map<string, InitializedReadonlyConfig<ConfigV0>>(
    await Promise.all(
      [...downloadedModulesMap.entries(), ...localModuleAbsolutePaths].map(
        ([originalGetValue, moduleAbsolutePath]) =>
          (async (): Promise<[string, InitializedReadonlyConfig<ConfigV0>]> => {
            const moduleConfig = await initReadonlyModuleConfig(
              moduleAbsolutePath
            );

            if (moduleConfig === null) {
              return commandObj.error(
                isUrl(originalGetValue)
                  ? `Downloaded invalid module from ${color.yellow(
                      originalGetValue
                    )} to ${moduleAbsolutePath}`
                  : `Invalid module found at ${moduleAbsolutePath}`
              );
            }

            return [moduleAbsolutePath, moduleConfig];
          })()
      )
    )
  );

  const fluenceLockConfig = await initFluenceLockConfig();
  const marineCli = await initMarineCli(fluenceConfig, fluenceLockConfig);
  await buildModules([...moduleConfigsMap.values()], marineCli);

  const workers: UploadArgConfig["workers"] = hostsOrDeals
    .filter(([workerName]) => workersToHost.includes(workerName))
    .map(([workerName, { peerIds = [] }]) => {
      if (hosts && peerIds.length === 0) {
        commandObj.error(
          `You must have at least one peerId listed in ${color.yellow(
            "peerIds"
          )} property in ${color.yellow(
            `hosts.${workerName}`
          )} property in ${FLUENCE_CONFIG_FILE_NAME}`
        );
      }

      const workerConfig = workersFromFluenceConfig[workerName];

      assert(
        workerConfig !== undefined,
        `Unreachable. workerNamesNotFoundInWorkersConfig was empty but error still happened. Looking for ${workerName} in ${JSON.stringify(
          workersFromFluenceConfig
        )}`
      );

      const services = workerConfig.services.map((serviceName) => {
        const maybeServiceConfig = serviceConfigs.find(
          (c) => c.serviceName === serviceName
        );

        assert(
          maybeServiceConfig !== undefined,
          `Unreachable. Service should not be undefined because serviceConfigs where created from workerConfig.services. Looking for ${serviceName} in ${JSON.stringify(
            serviceConfigs
          )}`
        );

        const { overrideModules, serviceConfig } = maybeServiceConfig;

        const { [FACADE_MODULE_NAME]: facadeModule, ...restModules } =
          serviceConfig.modules;

        const modules = [
          ...Object.entries(restModules),
          [FACADE_MODULE_NAME, facadeModule] as const,
        ].map(([name, { get }]) => {
          const moduleUrlOrAbsolutePath = getUrlOrAbsolutePath(
            get,
            serviceConfig.$getDirPath()
          );

          const moduleConfig = moduleConfigsMap.get(moduleUrlOrAbsolutePath);

          assert(
            moduleConfig !== undefined,
            `Unreachable. Module should not be undefined because moduleConfigsMap was created from serviceConfigs.modules. Searching for ${moduleUrlOrAbsolutePath} in ${JSON.stringify(
              Object.fromEntries(moduleConfigsMap.entries())
            )}`
          );

          const overriddenModuleConfig = {
            ...moduleConfig,
            ...overrideModules?.[name],
          };

          return {
            wasm: getModuleWasmPath(overriddenModuleConfig),
            config: JSON.stringify(
              moduleToJSONModuleConfig(overriddenModuleConfig)
            ),
          };
        });

        return {
          name: serviceName,
          modules,
        };
      });

      return {
        name: workerName,
        hosts: peerIds,
        config: {
          services,
          spells: [],
        },
      };
    });

  return {
    workers,
    installation_script: spellInstallAirScript,
    installation_trigger: {
      clock: { start_sec: 1676293670, end_sec: 0, period_sec: 600 },
      connections: { connect: false, disconnect: false },
      blockchain: { start_block: 0, end_block: 0 },
    },
  };
};
