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
import path from "node:path";

import oclifColor from "@oclif/color";
const color = oclifColor.default;

import { commandObj } from "./commandObj.js";
import type { FluenceConfig } from "./configs/project/fluence.js";
import type { FluenceLockConfig } from "./configs/project/fluenceLock.js";
import {
  BIN_DIR_NAME,
  fluenceCargoDependencies,
  REQUIRED_RUST_TOOLCHAIN,
  RUST_WASM32_WASI_TARGET,
} from "./const.js";
import { addCountlyLog } from "./countly.js";
import { execPromise } from "./execPromise.js";
import {
  handleFluenceConfig,
  handleInstallation,
  handleLockConfig,
  resolveDependencyPathAndTmpPath,
  resolveVersionToInstall,
  splitPackageNameAndVersion,
} from "./helpers/package.js";
import { replaceHomeDir } from "./helpers/replaceHomeDir.js";

const CARGO = "cargo";
const RUSTUP = "rustup";

const ensureRust = async (): Promise<void> => {
  if (!(await isRustInstalled())) {
    if (commandObj.config.windows) {
      commandObj.error(
        "Rust needs to be installed. Please visit https://www.rust-lang.org/tools/install for installation instructions"
      );
    }

    await execPromise({
      command: "curl",
      args: [
        "--proto",
        "'=https'",
        "--tlsv1.2",
        "-sSf",
        "https://sh.rustup.rs",
        "|",
        "sh",
        "-s",
        "--",
        "--quiet",
        "-y",
      ],
      options: {
        shell: true,
      },
      message: "Installing Rust",
      printOutput: true,
    });

    if (!(await isRustInstalled())) {
      commandObj.error(
        `Installed rust without errors but ${color.yellow(
          RUSTUP
        )} or ${color.yellow(CARGO)} not in PATH`
      );
    }
  }

  if (!(await hasRequiredRustToolchain())) {
    await execPromise({
      command: RUSTUP,
      args: ["install", REQUIRED_RUST_TOOLCHAIN],
      message: `Installing ${color.yellow(
        REQUIRED_RUST_TOOLCHAIN
      )} rust toolchain`,
      printOutput: true,
    });

    if (!(await hasRequiredRustToolchain())) {
      commandObj.error(
        `Not able to install ${color.yellow(
          REQUIRED_RUST_TOOLCHAIN
        )} rust toolchain`
      );
    }
  }

  if (!(await hasRequiredRustTarget())) {
    await execPromise({
      command: RUSTUP,
      args: ["target", "add", RUST_WASM32_WASI_TARGET],
      message: `Adding ${color.yellow(RUST_WASM32_WASI_TARGET)} rust target`,
      printOutput: true,
    });

    if (!(await hasRequiredRustTarget())) {
      commandObj.error(
        `Not able to install ${color.yellow(
          RUST_WASM32_WASI_TARGET
        )} rust target`
      );
    }
  }
};

const isRustInstalled = async (): Promise<boolean> => {
  try {
    await execPromise({
      command: CARGO,
      args: ["--version"],
    });

    await execPromise({
      command: RUSTUP,
      args: ["--version"],
    });

    return true;
  } catch {
    return false;
  }
};

const regExpRecommendedToolchain = new RegExp(
  `^${REQUIRED_RUST_TOOLCHAIN}.*\\(override\\)$`,
  "gm"
);

const hasRequiredRustToolchain = async (): Promise<boolean> => {
  const toolChainList = await execPromise({
    command: RUSTUP,
    args: ["toolchain", "list"],
  });

  const hasRequiredRustToolchain = toolChainList.includes(
    REQUIRED_RUST_TOOLCHAIN
  );

  if (
    hasRequiredRustToolchain &&
    !regExpRecommendedToolchain.test(toolChainList)
  ) {
    await execPromise({
      command: RUSTUP,
      args: ["override", "set", REQUIRED_RUST_TOOLCHAIN],
    });
  }

  return hasRequiredRustToolchain;
};

const hasRequiredRustTarget = async (): Promise<boolean> =>
  (
    await execPromise({
      command: RUSTUP,
      args: ["target", "list"],
    })
  ).includes(`${RUST_WASM32_WASI_TARGET} (installed)`);

export const getLatestVersionOfCargoDependency = async (
  name: string
): Promise<string> =>
  (
    (
      await execPromise({
        command: CARGO,
        args: ["search", name, "--limit", "1"],
      })
    ).split('"')[1] ??
    commandObj.error(
      `Not able to find the latest version of ${color.yellow(
        name
      )}. Please make sure ${color.yellow(name)} is spelled correctly`
    )
  ).trim();

type InstallCargoDependencyArg = {
  toolchain: string | undefined;
  name: string;
  version: string;
  dependencyTmpPath: string;
  dependencyPath: string;
};

const installCargoDependency = async ({
  toolchain,
  name,
  version,
  dependencyPath,
  dependencyTmpPath,
}: InstallCargoDependencyArg) => {
  await execPromise({
    command: CARGO,
    args: [
      ...(typeof toolchain === "string" ? [`+${toolchain}`] : []),
      "install",
      name,
    ],
    flags: {
      version,
      root: dependencyTmpPath,
    },
    message: `Installing ${name}@${version} to ${replaceHomeDir(
      dependencyPath
    )}`,
    printOutput: true,
  });
};

type CargoDependencyArg = {
  nameAndVersion: string;
  maybeFluenceConfig: FluenceConfig | null;
  maybeFluenceLockConfig: FluenceLockConfig | null;
  force?: boolean;
  toolchain?: string | undefined;
  explicitInstallation?: boolean;
};

export const ensureCargoDependency = async ({
  nameAndVersion,
  maybeFluenceConfig,
  maybeFluenceLockConfig,
  force = false,
  toolchain: toolchainFromArgs,
  explicitInstallation = false,
}: CargoDependencyArg): Promise<string> => {
  await ensureRust();
  const [name, maybeVersion] = splitPackageNameAndVersion(nameAndVersion);

  const version =
    resolveVersionToInstall({
      name,
      maybeVersion,
      explicitInstallation,
      maybeFluenceLockConfig,
      maybeFluenceConfig,
      packageManager: "cargo",
    }) ?? (await getLatestVersionOfCargoDependency(name));

  const maybeCargoDependencyInfo = fluenceCargoDependencies[name];
  const toolchain = toolchainFromArgs ?? maybeCargoDependencyInfo?.toolchain;

  const { dependencyPath, dependencyTmpPath } =
    await resolveDependencyPathAndTmpPath({
      name,
      packageManager: "cargo",
      version,
    });

  await handleInstallation({
    force,
    dependencyPath,
    dependencyTmpPath,
    explicitInstallation,
    name,
    version,
    installDependency: () =>
      installCargoDependency({
        dependencyPath,
        dependencyTmpPath,
        name,
        toolchain,
        version,
      }),
  });

  if (maybeFluenceConfig !== null) {
    await handleFluenceConfig({
      fluenceConfig: maybeFluenceConfig,
      name,
      packageManager: "cargo",
      versionFromArgs: maybeVersion ?? version,
    });

    await handleLockConfig({
      maybeFluenceLockConfig,
      name,
      version,
      packageManager: "cargo",
    });
  }

  addCountlyLog(`Using ${name}@${version} cargo dependency`);

  return maybeCargoDependencyInfo === undefined
    ? dependencyPath
    : path.join(dependencyPath, BIN_DIR_NAME, name);
};

type InstallAllDependenciesArg = {
  fluenceConfig: FluenceConfig;
  fluenceLockConfig: FluenceLockConfig;
  force: boolean;
};

export const installAllCargoDependenciesFromFluenceConfig = async ({
  fluenceConfig,
  fluenceLockConfig,
  force,
}: InstallAllDependenciesArg): Promise<void> => {
  for (const [name, version] of Object.entries(
    fluenceConfig?.dependencies?.cargo ?? {}
  )) {
    assert(name !== undefined && version !== undefined);

    // Not installing dependencies in parallel
    // for cargo logs to be clearly readable
    // eslint-disable-next-line no-await-in-loop
    await ensureCargoDependency({
      nameAndVersion: `${name}@${version}`,
      maybeFluenceConfig: fluenceConfig,
      maybeFluenceLockConfig: fluenceLockConfig,
      force,
    });
  }
};
