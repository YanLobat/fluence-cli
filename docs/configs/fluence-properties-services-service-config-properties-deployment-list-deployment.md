## items Type

`object` ([Deployment](fluence-properties-services-service-config-properties-deployment-list-deployment.md))

# items Properties

| Property                            | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                       |
| :---------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [keyPairName](#keypairname)         | `string` | Optional | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-keypairname.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/keyPairName")   |
| [deployId](#deployid)               | `string` | Required | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-deployid.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/deployId")         |
| [count](#count)                     | `number` | Optional | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-count.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/count")               |
| [peerId](#peerid)                   | `string` | Optional | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-peerid.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/peerId")             |
| [peerIds](#peerids)                 | `array`  | Optional | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-peer-ids.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/peerIds")          |
| [overrideModules](#overridemodules) | `object` | Optional | cannot be null | [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-overrides.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/overrideModules") |

## keyPairName

The name of the Key Pair to use. It is resolved in the following order (from the lowest to the highest priority):

1.  "defaultKeyPairName" property from user-secrets.yaml
2.  "defaultKeyPairName" property from project-secrets.yaml
3.  "keyPairName" property from the top level of fluence.yaml
4.  "keyPairName" property from the "services" level of fluence.yaml
5.  "keyPairName" property from the individual "deploy" property item level of fluence.yaml

`keyPairName`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-keypairname.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/keyPairName")

### keyPairName Type

`string`

## deployId

This id can be used in Aqua to access actually deployed peer and service ids. The ID must start with a lowercase letter and contain only letters, numbers, and underscores.

`deployId`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-deployid.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/deployId")

### deployId Type

`string`

## count

Number of services to deploy. Default: 1 or if "peerIds" property is provided - exactly the number of peerIds

`count`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-count.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/count")

### count Type

`number`

### count Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## peerId

Peer id or peer id name to deploy to. Default: Peer ids from the "relay" property of fluence.yaml are selected for each deploy. Named peerIds can be listed in "peerIds" property of fluence.yaml)

`peerId`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-peerid.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/peerId")

### peerId Type

`string`

## peerIds

Peer ids or peer id names to deploy to. Overrides "peerId" property. Named peerIds can be listed in "peerIds" property of fluence.yaml)

`peerIds`

*   is optional

*   Type: `string[]`

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-peer-ids.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/peerIds")

### peerIds Type

`string[]`

## overrideModules

A map of modules to override

`overrideModules`

*   is optional

*   Type: `object` ([Overrides](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-overrides.md))

*   cannot be null

*   defined in: [fluence.yaml](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-overrides.md "https://fluence.dev/schemas/fluence.yaml#/properties/services/additionalProperties/properties/deploy/items/properties/overrideModules")

### overrideModules Type

`object` ([Overrides](fluence-properties-services-service-config-properties-deployment-list-deployment-properties-overrides.md))
