/* eslint-disable */
// @ts-nocheck
/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.10.1
 *
 */
import { FluencePeer } from '@fluencelabs/fluence';
import type { CallParams$$ } from '@fluencelabs/fluence/dist/internal/compilerSupport/v4.js'
import {
    callFunction$$,
    registerService$$,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v4.js';


// Services

// Functions
export type Upload_deployArgConfig = { installation_script: string; installation_trigger: { blockchain: { end_block: number; start_block: number; }; clock: { end_sec: number; period_sec: number; start_sec: number; }; connections: { connect: boolean; disconnect: boolean; }; }; workers: { config: { services: { modules: { config: string; wasm: string; }[]; name: string; }[]; spells: { config: { blockchain: { end_block: number; start_block: number; }; clock: { end_sec: number; period_sec: number; start_sec: number; }; connections: { connect: boolean; disconnect: boolean; }; }; init_args: any; name: string; script: string; }[]; }; hosts: string[]; name: string; }[]; } 
export type Upload_deployResult = { workers: { definition: string; installation_spells: { host_id: string; spell_id: string; worker_id: string; }[]; name: string; }[]; }
export function upload_deploy(
    config_: Upload_deployArgConfig,
    config?: {ttl?: number}
): Promise<Upload_deployResult>;

export function upload_deploy(
    peer: FluencePeer,
    config_: Upload_deployArgConfig,
    config?: {ttl?: number}
): Promise<Upload_deployResult>;

export function upload_deploy(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                         (call %init_peer_id% ("getDataSrv" "config") [] config)
                        )
                        (new $deploy_defs
                         (seq
                          (seq
                           (fold config.$.workers! w-0
                            (seq
                             (seq
                              (seq
                               (new $services
                                (seq
                                 (seq
                                  (seq
                                   (seq
                                    (fold w-0.$.config.services! s-0
                                     (seq
                                      (new $modules
                                       (seq
                                        (seq
                                         (seq
                                          (fold s-0.$.modules! m-0
                                           (seq
                                            (seq
                                             (seq
                                              (seq
                                               (call %init_peer_id% ("ipfs_client" "upload") ["/dns4/ipfs.fluence.dev/tcp/5001" m-0.$.wasm!] wasm)
                                               (call %init_peer_id% ("ipfs_client" "upload_string") ["/dns4/ipfs.fluence.dev/tcp/5001" m-0.$.config!] cfg)
                                              )
                                              (call %init_peer_id% ("json" "obj") ["config" cfg "wasm" wasm] Module_obj)
                                             )
                                             (ap Module_obj $modules)
                                            )
                                            (next m-0)
                                           )
                                          )
                                          (canon %init_peer_id% $modules  #modules_canon)
                                         )
                                         (call %init_peer_id% ("json" "obj") ["modules" #modules_canon "name" s-0.$.name!] Service_obj)
                                        )
                                        (ap Service_obj $services)
                                       )
                                      )
                                      (next s-0)
                                     )
                                    )
                                    (canon %init_peer_id% $services  #services_canon)
                                   )
                                   (call %init_peer_id% ("json" "obj") ["services" #services_canon "spells" []] WorkerDefinition_obj)
                                  )
                                  (call %init_peer_id% ("json" "stringify") [WorkerDefinition_obj] json)
                                 )
                                 (call %init_peer_id% ("ipfs_client" "upload_string") ["/dns4/ipfs.fluence.dev/tcp/5001" json] cid)
                                )
                               )
                               (call %init_peer_id% ("json" "obj") ["definition" cid "hosts" w-0.$.hosts! "name" w-0.$.name!] WorkerDeployDefinition_obj)
                              )
                              (ap WorkerDeployDefinition_obj $deploy_defs)
                             )
                             (next w-0)
                            )
                           )
                           (canon %init_peer_id% $deploy_defs  #deploy_defs_canon)
                          )
                          (call %init_peer_id% ("json" "obj") ["installation_script" config.$.installation_script! "installation_trigger" config.$.installation_trigger! "workers" #deploy_defs_canon] AppDeployDefinition_obj)
                         )
                        )
                       )
                       (new $workers
                        (seq
                         (seq
                          (fold AppDeployDefinition_obj.$.workers! w-1-0
                           (seq
                            (new $spells
                             (seq
                              (seq
                               (seq
                                (seq
                                 (fold w-1-0.$.hosts! h-0
                                  (seq
                                   (seq
                                    (call -relay- ("op" "noop") [])
                                    (xor
                                     (seq
                                      (seq
                                       (seq
                                        (seq
                                         (seq
                                          (null)
                                          (new $worker_id
                                           (seq
                                            (seq
                                             (seq
                                              (seq
                                               (call h-0 ("json" "obj") ["deal_id" "dummy-deal-id-123" "ipfs" "/dns4/ipfs.fluence.dev/tcp/5001" "worker_def_cid" w-1-0.$.definition!] WorkerSpellArgs_obj)
                                               (xor
                                                (call h-0 ("worker" "create") [] $worker_id)
                                                (call h-0 ("worker" "get_peer_id") [] $worker_id)
                                               )
                                              )
                                              (new $worker_id_test
                                               (seq
                                                (seq
                                                 (seq
                                                  (call h-0 ("math" "add") [0 1] worker_id_incr)
                                                  (fold $worker_id s
                                                   (seq
                                                    (seq
                                                     (ap s $worker_id_test)
                                                     (canon h-0 $worker_id_test  #worker_id_iter_canon)
                                                    )
                                                    (xor
                                                     (match #worker_id_iter_canon.length worker_id_incr
                                                      (null)
                                                     )
                                                     (next s)
                                                    )
                                                   )
                                                   (never)
                                                  )
                                                 )
                                                 (canon h-0 $worker_id_test  #worker_id_result_canon)
                                                )
                                                (ap #worker_id_result_canon worker_id_gate)
                                               )
                                              )
                                             )
                                             (xor
                                              (call worker_id_gate.$.[0]! ("spell" "install") [AppDeployDefinition_obj.$.installation_script! WorkerSpellArgs_obj AppDeployDefinition_obj.$.installation_trigger!] spell_id)
                                              (seq
                                               (seq
                                                (call -relay- ("op" "noop") [])
                                                (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                                               )
                                               (call -relay- ("op" "noop") [])
                                              )
                                             )
                                            )
                                            (new $worker_id_test-0
                                             (seq
                                              (seq
                                               (seq
                                                (call h-0 ("math" "add") [0 1] worker_id_incr-0)
                                                (fold $worker_id s
                                                 (seq
                                                  (seq
                                                   (ap s $worker_id_test-0)
                                                   (canon h-0 $worker_id_test-0  #worker_id_iter_canon-0)
                                                  )
                                                  (xor
                                                   (match #worker_id_iter_canon-0.length worker_id_incr-0
                                                    (null)
                                                   )
                                                   (next s)
                                                  )
                                                 )
                                                 (never)
                                                )
                                               )
                                               (canon h-0 $worker_id_test-0  #worker_id_result_canon-0)
                                              )
                                              (ap #worker_id_result_canon-0 worker_id_gate-0)
                                             )
                                            )
                                           )
                                          )
                                         )
                                         (call h-0 ("json" "obj") ["host_id" h-0 "spell_id" spell_id "worker_id" worker_id_gate-0.$.[0]!] DeployedSpell_obj)
                                        )
                                        (ap DeployedSpell_obj $spells)
                                       )
                                       (call -relay- ("op" "noop") [])
                                      )
                                      (xor
                                       (par
                                        (seq
                                         (new $array-inline
                                          (seq
                                           (seq
                                            (seq
                                             (seq
                                              (seq
                                               (ap "deployed spell" $array-inline)
                                               (ap spell_id $array-inline)
                                              )
                                              (ap worker_id_gate-0.$.[0]! $array-inline)
                                             )
                                             (ap "to" $array-inline)
                                            )
                                            (ap h-0 $array-inline)
                                           )
                                           (canon %init_peer_id% $array-inline  #array-inline-0)
                                          )
                                         )
                                         (call %init_peer_id% ("run-console" "print") [#array-inline-0])
                                        )
                                        (null)
                                       )
                                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                                      )
                                     )
                                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                                    )
                                   )
                                   (next h-0)
                                  )
                                 )
                                 (canon %init_peer_id% $spells  #spells_canon)
                                )
                                (call %init_peer_id% ("json" "obj") ["definition" w-1-0.$.definition! "installation_spells" #spells_canon "name" w-1-0.$.name!] DeployedWorkers_obj)
                               )
                               (ap DeployedWorkers_obj $workers)
                              )
                              (xor
                               (par
                                (seq
                                 (new $array-inline-1
                                  (seq
                                   (seq
                                    (seq
                                     (ap "deployed workers" $array-inline-1)
                                     (canon %init_peer_id% $workers  #push-to-stream-135)
                                    )
                                    (ap #push-to-stream-135 $array-inline-1)
                                   )
                                   (canon %init_peer_id% $array-inline-1  #array-inline-1-0)
                                  )
                                 )
                                 (call %init_peer_id% ("run-console" "print") [#array-inline-1-0])
                                )
                                (null)
                               )
                               (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                              )
                             )
                            )
                            (next w-1-0)
                           )
                          )
                          (canon %init_peer_id% $workers  #workers_canon)
                         )
                         (call %init_peer_id% ("json" "obj") ["workers" #workers_canon] DeployedAppWorkers_obj)
                        )
                       )
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [DeployedAppWorkers_obj])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 5])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 6])
                    )
    `
    return callFunction$$(
        args,
        {
    "functionName" : "upload_deploy",
    "arrow" : {
        "tag" : "arrow",
        "domain" : {
            "tag" : "labeledProduct",
            "fields" : {
                "config" : {
                    "tag" : "struct",
                    "name" : "LocalAppDeployConfig",
                    "fields" : {
                        "installation_script" : {
                            "tag" : "scalar",
                            "name" : "string"
                        },
                        "installation_trigger" : {
                            "tag" : "struct",
                            "name" : "TriggerConfig",
                            "fields" : {
                                "blockchain" : {
                                    "tag" : "struct",
                                    "name" : "BlockChainConfig",
                                    "fields" : {
                                        "end_block" : {
                                            "tag" : "scalar",
                                            "name" : "u32"
                                        },
                                        "start_block" : {
                                            "tag" : "scalar",
                                            "name" : "u32"
                                        }
                                    }
                                },
                                "clock" : {
                                    "tag" : "struct",
                                    "name" : "ClockConfig",
                                    "fields" : {
                                        "end_sec" : {
                                            "tag" : "scalar",
                                            "name" : "u32"
                                        },
                                        "period_sec" : {
                                            "tag" : "scalar",
                                            "name" : "u32"
                                        },
                                        "start_sec" : {
                                            "tag" : "scalar",
                                            "name" : "u32"
                                        }
                                    }
                                },
                                "connections" : {
                                    "tag" : "struct",
                                    "name" : "ConnectionPoolConfig",
                                    "fields" : {
                                        "connect" : {
                                            "tag" : "scalar",
                                            "name" : "bool"
                                        },
                                        "disconnect" : {
                                            "tag" : "scalar",
                                            "name" : "bool"
                                        }
                                    }
                                }
                            }
                        },
                        "workers" : {
                            "tag" : "array",
                            "type" : {
                                "tag" : "struct",
                                "name" : "LocalWorkerDeployConfig",
                                "fields" : {
                                    "config" : {
                                        "tag" : "struct",
                                        "name" : "LocalWorkerConfig",
                                        "fields" : {
                                            "services" : {
                                                "tag" : "array",
                                                "type" : {
                                                    "tag" : "struct",
                                                    "name" : "LocalService",
                                                    "fields" : {
                                                        "modules" : {
                                                            "tag" : "array",
                                                            "type" : {
                                                                "tag" : "struct",
                                                                "name" : "LocalModule",
                                                                "fields" : {
                                                                    "config" : {
                                                                        "tag" : "scalar",
                                                                        "name" : "string"
                                                                    },
                                                                    "wasm" : {
                                                                        "tag" : "scalar",
                                                                        "name" : "string"
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "name" : {
                                                            "tag" : "scalar",
                                                            "name" : "string"
                                                        }
                                                    }
                                                }
                                            },
                                            "spells" : {
                                                "tag" : "array",
                                                "type" : {
                                                    "tag" : "struct",
                                                    "name" : "LocalSpell",
                                                    "fields" : {
                                                        "config" : {
                                                            "tag" : "struct",
                                                            "name" : "TriggerConfig",
                                                            "fields" : {
                                                                "blockchain" : {
                                                                    "tag" : "struct",
                                                                    "name" : "BlockChainConfig",
                                                                    "fields" : {
                                                                        "end_block" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "u32"
                                                                        },
                                                                        "start_block" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "u32"
                                                                        }
                                                                    }
                                                                },
                                                                "clock" : {
                                                                    "tag" : "struct",
                                                                    "name" : "ClockConfig",
                                                                    "fields" : {
                                                                        "end_sec" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "u32"
                                                                        },
                                                                        "period_sec" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "u32"
                                                                        },
                                                                        "start_sec" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "u32"
                                                                        }
                                                                    }
                                                                },
                                                                "connections" : {
                                                                    "tag" : "struct",
                                                                    "name" : "ConnectionPoolConfig",
                                                                    "fields" : {
                                                                        "connect" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "bool"
                                                                        },
                                                                        "disconnect" : {
                                                                            "tag" : "scalar",
                                                                            "name" : "bool"
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "init_args" : {
                                                            "tag" : "topType"
                                                        },
                                                        "name" : {
                                                            "tag" : "scalar",
                                                            "name" : "string"
                                                        },
                                                        "script" : {
                                                            "tag" : "scalar",
                                                            "name" : "string"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "hosts" : {
                                        "tag" : "array",
                                        "type" : {
                                            "tag" : "scalar",
                                            "name" : "string"
                                        }
                                    },
                                    "name" : {
                                        "tag" : "scalar",
                                        "name" : "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "codomain" : {
            "tag" : "unlabeledProduct",
            "items" : [
                {
                    "tag" : "struct",
                    "name" : "DeployedAppWorkers",
                    "fields" : {
                        "workers" : {
                            "tag" : "array",
                            "type" : {
                                "tag" : "struct",
                                "name" : "DeployedWorkers",
                                "fields" : {
                                    "definition" : {
                                        "tag" : "scalar",
                                        "name" : "string"
                                    },
                                    "installation_spells" : {
                                        "tag" : "array",
                                        "type" : {
                                            "tag" : "struct",
                                            "name" : "DeployedSpell",
                                            "fields" : {
                                                "host_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                },
                                                "spell_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                },
                                                "worker_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                }
                                            }
                                        }
                                    },
                                    "name" : {
                                        "tag" : "scalar",
                                        "name" : "string"
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }
    },
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}

export type Get_logsArgApp_workers = { workers: { definition: string; installation_spells: { host_id: string; spell_id: string; worker_id: string; }[]; name: string; }[]; } 

export function get_logs(
    app_workers: Get_logsArgApp_workers,
    config?: {ttl?: number}
): Promise<{ host_id: string; logs: string[]; spell_id: string; worker_name: string; }[]>;

export function get_logs(
    peer: FluencePeer,
    app_workers: Get_logsArgApp_workers,
    config?: {ttl?: number}
): Promise<{ host_id: string; logs: string[]; spell_id: string; worker_name: string; }[]>;

export function get_logs(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                        (call %init_peer_id% ("getDataSrv" "app_workers") [] app_workers)
                       )
                       (fold app_workers.$.workers! w-0
                        (seq
                         (fold w-0.$.installation_spells! i_spell-0
                          (seq
                           (seq
                            (seq
                             (seq
                              (null)
                              (call -relay- ("op" "noop") [])
                             )
                             (call i_spell-0.$.host_id! ("op" "noop") [])
                            )
                            (xor
                             (seq
                              (seq
                               (seq
                                (seq
                                 (call i_spell-0.$.worker_id! (i_spell-0.$.spell_id! "list_get_strings") ["logs"] get_res)
                                 (call i_spell-0.$.worker_id! ("json" "obj") ["host_id" i_spell-0.$.host_id! "logs" get_res.$.strings! "spell_id" i_spell-0.$.spell_id! "worker_name" w-0.$.name!] Log_obj)
                                )
                                (ap Log_obj $logs)
                               )
                               (call i_spell-0.$.host_id! ("op" "noop") [])
                              )
                              (call -relay- ("op" "noop") [])
                             )
                             (seq
                              (seq
                               (call i_spell-0.$.host_id! ("op" "noop") [])
                               (call -relay- ("op" "noop") [])
                              )
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                             )
                            )
                           )
                           (next i_spell-0)
                          )
                         )
                         (next w-0)
                        )
                       )
                      )
                      (xor
                       (seq
                        (canon %init_peer_id% $logs  #logs_canon)
                        (call %init_peer_id% ("callbackSrv" "response") [#logs_canon])
                       )
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                    )
    `
    return callFunction$$(
        args,
        {
    "functionName" : "get_logs",
    "arrow" : {
        "tag" : "arrow",
        "domain" : {
            "tag" : "labeledProduct",
            "fields" : {
                "app_workers" : {
                    "tag" : "struct",
                    "name" : "DeployedAppWorkers",
                    "fields" : {
                        "workers" : {
                            "tag" : "array",
                            "type" : {
                                "tag" : "struct",
                                "name" : "DeployedWorkers",
                                "fields" : {
                                    "definition" : {
                                        "tag" : "scalar",
                                        "name" : "string"
                                    },
                                    "installation_spells" : {
                                        "tag" : "array",
                                        "type" : {
                                            "tag" : "struct",
                                            "name" : "DeployedSpell",
                                            "fields" : {
                                                "host_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                },
                                                "spell_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                },
                                                "worker_id" : {
                                                    "tag" : "scalar",
                                                    "name" : "string"
                                                }
                                            }
                                        }
                                    },
                                    "name" : {
                                        "tag" : "scalar",
                                        "name" : "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "codomain" : {
            "tag" : "unlabeledProduct",
            "items" : [
                {
                    "tag" : "array",
                    "type" : {
                        "tag" : "struct",
                        "name" : "Log",
                        "fields" : {
                            "host_id" : {
                                "tag" : "scalar",
                                "name" : "string"
                            },
                            "logs" : {
                                "tag" : "array",
                                "type" : {
                                    "tag" : "scalar",
                                    "name" : "string"
                                }
                            },
                            "spell_id" : {
                                "tag" : "scalar",
                                "name" : "string"
                            },
                            "worker_name" : {
                                "tag" : "scalar",
                                "name" : "string"
                            }
                        }
                    }
                }
            ]
        }
    },
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}

/* eslint-enable */