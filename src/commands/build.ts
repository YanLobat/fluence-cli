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

import { BaseCommand, baseFlags } from "../baseCommand.js";
import { build } from "../lib/build.js";
import { commandObj } from "../lib/commandObj.js";
import { initFluenceLockConfig } from "../lib/configs/project/fluenceLock.js";
import { FLUENCE_CONFIG_FILE_NAME } from "../lib/const.js";
import { getExistingKeyPair } from "../lib/keypairs.js";
import { initCli } from "../lib/lifecyle.js";
import { initMarineCli } from "../lib/marineCli.js";

export default class Build extends BaseCommand<typeof Build> {
  static override description = `Build all application services, described in ${FLUENCE_CONFIG_FILE_NAME} and generate aqua interfaces for them`;
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {
    ...baseFlags,
  };
  async run(): Promise<void> {
    const { fluenceConfig } = await initCli(
      this,
      await this.parse(Build),
      true
    );

    const defaultKeyPair = await getExistingKeyPair(fluenceConfig.keyPairName);

    if (defaultKeyPair instanceof Error) {
      commandObj.error(defaultKeyPair.message);
    }

    const maybeFluenceLockConfig = await initFluenceLockConfig();

    const marineCli = await initMarineCli(
      fluenceConfig,
      maybeFluenceLockConfig
    );

    await build({
      fluenceConfig,
      defaultKeyPair,
      marineCli,
    });
  }
}
